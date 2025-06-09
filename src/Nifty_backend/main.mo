import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";

actor {
  // Semua variabel stable harus di dalam blok actor
  stable var files : [FileMeta] = [];
  stable var owners : [Principal] = [];

  // Definisi tipe dan fungsi juga di dalam actor
  type FileMeta = {
    name : Text;
    mime_type : Text;
    data : Blob;
  };

  public shared({caller}) func upload_and_mint_nft(
    file_bytes : [Nat8],
    name : Text,
    mime_type : Text
  ) : async Nat {
    let file : FileMeta = {
      name = name;
      mime_type = mime_type;
      data = Blob.fromArray(file_bytes);
    };
    files := Array.append(files, [file]);
    owners := Array.append(owners, [caller]);
    return files.size() - 1;
  };

  public query({caller}) func get_user_files() : async [FileMeta] {
    var result : [FileMeta] = [];
    for (i in files.keys()) {
      if (owners[i] == caller) {
        result := Array.append(result, [files[i]]);
      }
    };
    return result;
  };
}