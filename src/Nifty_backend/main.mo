import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Debug "mo:base/Debug"; // Import Debug module untuk logging sederhana

actor {
  stable var files : [FileMeta] = [];
  stable var folders : [Text] = [];
  stable var logs : [Text] = []; // Tambahkan variable untuk menyimpan log

  type FileMeta = {
    name : Text;
    mime_type : Text;
    data : Blob;
    folder : Text;
    owner : Principal;
  };

  // Fungsi helper untuk menambahkan log
  private func add_log(message : Text) : () {
      logs := Array.append(logs, [message]);
      Debug.print("Log: " # message); // Cetak ke stdout di deploy lokal
  };

  public shared({caller}) func upload_and_mint_nft(
    file_bytes : [Nat8],
    name : Text,
    mime_type : Text,
    folderName : Text
  ) : async Nat {
    add_log("Attempting to upload file: " # name # " to folder: " # folderName); // Contoh logging
    if (Array.find<Text>(folders, func(f : Text) : Bool { return f == folderName; }) == null) {
      folders := Array.append<Text>(folders, [folderName]);
      add_log("Created new folder: " # folderName);
    };

    let file : FileMeta = {
      name = name;
      mime_type = mime_type;
      data = Blob.fromArray(file_bytes);
      folder = folderName;
      owner = caller;
    };

    files := Array.append<FileMeta>(files, [file]);
    add_log("File " # name # " uploaded by " # Principal.toText(caller));
    return files.size() - 1;
  };

  public query({caller}) func get_user_files() : async [FileMeta] {
    add_log("User " # Principal.toText(caller) # " requested files.");
    var result : [FileMeta] = [];
    for (i : Nat in files.keys()) {
      if (files[i].owner == caller) {
        result := Array.append<FileMeta>(result, [files[i]]);
      }
    };
    return result;
  };

  public query({caller}) func get_user_folders() : async [Text] {
    add_log("User " # Principal.toText(caller) # " requested folders.");
    return folders;
  };

  public shared({caller}) func create_folder(name : Text) : async () {
    add_log("User " # Principal.toText(caller) # " attempting to create folder: " # name);
    if (Array.find<Text>(folders, func(f : Text) : Bool { return f == name; }) == null) {
      folders := Array.append<Text>(folders, [name]);
      add_log("Folder " # name # " created.");
    };
  };

  public shared({caller}) func edit_folder(oldName : Text, newName : Text) : async () {
    add_log("User " # Principal.toText(caller) # " attempting to edit folder from " # oldName # " to " # newName);
    folders := Array.map<Text, Text>(folders, func(f : Text) : Text {
      if (f == oldName) newName else f
    });

    files := Array.map<FileMeta, FileMeta>(files, func(file : FileMeta) : FileMeta {
      if (file.folder == oldName) {
        { file with folder = newName }
      } else {
        file
      }
    });
    add_log("Folder " # oldName # " edited to " # newName);
  };

  public shared({caller}) func delete_folder(name : Text) : async () {
    add_log("User " # Principal.toText(caller) # " attempting to delete folder: " # name);
    folders := Array.filter<Text>(folders, func(f : Text) : Bool { return f != name; });

    let defaultFolder = "default_folder";
    if (Array.find<Text>(folders, func(f : Text) : Bool { return f == defaultFolder; }) == null) {
      folders := Array.append<Text>(folders, [defaultFolder]);
      add_log("Default folder " # defaultFolder # " ensured after deletion.");
    };

    files := Array.map<FileMeta, FileMeta>(files, func(file : FileMeta) : FileMeta {
      if (file.folder == name) {
        { file with folder = defaultFolder }
      } else {
        file
      }
    });
    add_log("Folder " # name # " deleted, associated files moved to " # defaultFolder);
  };

  // Ubah baris ini:
 public query({caller}) func fetch_canister_logs() : async [Text] { // Pastikan ada ({caller}) di sini
    // Pastikan tidak ada baris `assert` yang memblokir akses
    add_log("fetch_canister_logs called by " # Principal.toText(caller));
    return logs;
};
};