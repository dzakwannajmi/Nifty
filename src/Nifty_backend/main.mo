import Debug     "mo:base/Debug";
import Text      "mo:base/Text";
import Array     "mo:base/Array";
import Principal "mo:base/Principal";
import Result    "mo:base/Result";
import Drive     "Drive";

actor {
  stable var userFolders : Drive.FolderState = [];
  stable var files       : Drive.FileState   = [];
  stable var logs        : [Text]            = [];

  private func log(msg: Text) {
    logs := Array.append(logs, [msg]);
    Debug.print("LOG: " # msg);
  };

  public shared (msg) func create_folder(name: Text) : async () {
    if (name == "") return;
    let caller = msg.caller;
    userFolders := Drive.createFolder(userFolders, caller, name);
    log("Folder '" # name # "' dibuat oleh " # Principal.toText(caller));
  };

  public shared (msg) func delete_folder(name: Text) : async () {
    let caller = msg.caller;
    let (newFolders, updatedFiles) = Drive.deleteFolder(userFolders, files, caller, name);
    userFolders := newFolders;
    files := updatedFiles;
    log("Folder '" # name # "' dihapus oleh " # Principal.toText(caller));
  };

  public shared query (msg) func get_user_folders() : async [Text] {
    Drive.getFs(userFolders, msg.caller)
  };

  public shared (msg) func upload_file(
    cid: Text,
    name: Text,
    mime_type: Text,
    folder: Text
  ) : async Result.Result<Nat, Text> {
    let caller = msg.caller;

    if (cid == "" or name == "") return #err("Invalid metadata");

    let (newFiles, updatedFolders, newId) =
      Drive.uploadFile(files, userFolders, caller, cid, name, mime_type, folder);

    files := newFiles;
    userFolders := updatedFolders;

    log("File '" # name # "' di-upload oleh " # Principal.toText(caller));

    #ok(newId)
  };

  public shared query (msg) func get_user_files() : async [Drive.FileMeta] {
    Drive.getUserFiles(files, msg.caller)
  };

  public shared query (msg) func fetch_canister_logs() : async [Text] {
    logs
  };
};
