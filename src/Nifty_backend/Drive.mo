import Principal "mo:base/Principal";
import Array     "mo:base/Array";
import Nat       "mo:base/Nat";
import Text      "mo:base/Text";

module Drive {
  public type FileMeta = {
    id        : Nat;
    name      : Text;
    mime_type : Text;
    folder    : Text;
    owner     : Principal;
    cid       : Text;
  };

  public type FolderState = [(Principal, [Text])];
  public type FileState   = [FileMeta];

  public func getFs(userFolders: FolderState, p: Principal) : [Text] {
    switch (Array.find<(Principal, [Text])>(userFolders, func(pair) { pair.0 == p })) {
      case (?(_, fs)) fs;
      case null        []
    }
  };

  public func putFs(
    userFolders: FolderState,
    p:           Principal,
    fs:          [Text]
  ) : FolderState {
    let rebuilt = Array.foldLeft<(Principal,[Text]), FolderState>(
      userFolders,
      ([] : FolderState),
      func(acc, pair) {
        if (pair.0 == p) Array.append(acc, [(p, fs)])
        else             Array.append(acc, [pair])
      }
    );
    if (Array.find<(Principal,[Text])>(userFolders, func(pr){ pr.0 == p }) == null) {
      Array.append(rebuilt, [(p, fs)])
    } else {
      rebuilt
    }
  };

  public func createFolder(userFolders: FolderState, caller: Principal, name: Text) : FolderState {
    let fs = getFs(userFolders, caller);
    if (Array.find<Text>(fs, func(x) { x == name }) == null) {
      putFs(userFolders, caller, Array.append(fs, [name]))
    } else {
      userFolders
    }
  };

  public func deleteFolder(
    userFolders: FolderState,
    files:       FileState,
    caller:      Principal,
    name:        Text
  ) : (FolderState, FileState) {
    let newFs        = Array.filter<Text>(getFs(userFolders, caller), func(x) { x != name });
    let updatedFold  = putFs(userFolders, caller, newFs);
    let updatedFiles = Array.map<FileMeta, FileMeta>(
      files,
      func(f) {
        if (f.owner == caller and f.folder == name) {
          { f with folder = "default" }
        } else {
          f
        }
      }
    );
    (updatedFold, updatedFiles)
  };

  public func uploadFile(
    files:       FileState,
    userFolders: FolderState,
    caller:      Principal,
    cid:         Text,
    name:        Text,
    mime_type:   Text,
    folder:      Text
  ) : (FileState, FolderState, Nat) {
    let fs = getFs(userFolders, caller);
    let updatedFolders = if (Array.find<Text>(fs, func(x) { x == folder }) == null) {
      putFs(userFolders, caller, Array.append(fs, [folder]))
    } else {
      userFolders
    };
    let newId = files.size();
    let file  = {
      id = newId;
      name;
      mime_type;
      folder;
      owner = caller;
      cid = cid;
    };
    (Array.append(files, [file]), updatedFolders, newId)
  };

  public func getUserFiles(files: FileState, caller: Principal) : [FileMeta] {
    Array.filter<FileMeta>(files, func(f) { f.owner == caller })
  };
};
