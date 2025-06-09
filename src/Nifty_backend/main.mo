import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";

actor {
  // Variabel stable untuk menyimpan metadata file, pemilik, dan daftar folder
  stable var files : [FileMeta] = [];
  stable var owners : [Principal] = [];
  stable var folders : [Text] = []; // Variabel baru untuk menyimpan daftar nama folder

  // Definisi tipe FileMeta: sekarang mencakup properti 'folder'
  type FileMeta = {
    name : Text;
    mime_type : Text;
    data : Blob;
    folder : Text; // Menyimpan nama folder
  };

  // Fungsi untuk mengunggah dan mencetak NFT (file)
  public shared({caller}) func upload_and_mint_nft(
    file_bytes : [Nat8],
    name : Text,
    mime_type : Text,
    folderName : Text // Argumen untuk nama folder
  ) : async Nat {
    // Pastikan folderName ditambahkan ke daftar folder jika belum ada
    if (Array.find(folders, func(f) { return f == folderName; }) == null) {
      folders := Array.append(folders, [folderName]);
    };

    let file : FileMeta = {
      name = name;
      mime_type = mime_type;
      data = Blob.fromArray(file_bytes);
      folder = folderName; // Menyimpan nama folder di metadata file
    };
    files := Array.append(files, [file]);
    owners := Array.append(owners, [caller]);
    return files.size() - 1; // Mengembalikan indeks file yang baru diunggah
  };

  // Fungsi untuk mendapatkan daftar file milik pengguna saat ini
  public query({caller}) func get_user_files() : async [FileMeta] {
  var result : [FileMeta] = [];
  for (i in files.keys()) {
    if (owners[i] == caller) {
      result := Array.append(result, [files[i]]);
    }
  }
  return result;
}

  // --- FUNGSI BARU UNTUK MANAJEMEN FOLDER ---

  // Fungsi untuk mendapatkan daftar semua folder yang ada
  public query({caller}) func get_user_folders() : async [Text] {
    return folders;
  };

  // Fungsi untuk membuat folder baru
  public shared({caller}) func create_folder(name : Text) : async () {
    // Tambahkan folder hanya jika belum ada untuk menghindari duplikasi
    if (Array.find(folders, func(f) { return f == name; }) == null) {
      folders := Array.append(folders, [name]);
    }
  };

  // Fungsi untuk mengedit (mengganti nama) folder
  public shared({caller}) func edit_folder(oldName : Text, newName : Text) : async () {
    // Cari dan ganti nama folder di daftar folders
    for (i in folders.keys()) {
      if (folders[i] == oldName) {
        folders[i] := newName;
        break; // Keluar dari loop setelah mengganti
      }
    };
    // Perbarui properti folder di semua FileMeta yang terkait dengan folder lama
    for (f_idx in files.keys()) {
      if (files[f_idx].folder == oldName) {
        files[f_idx].folder := newName;
      }
    }
  };

  // Fungsi untuk menghapus folder
  public shared({caller}) func delete_folder(name : Text) : async () {
    // Hapus folder dari daftar folders
    folders := Array.filter(folders, func(f) { return f != name; });

    // Pindahkan file yang ada di folder yang dihapus ke 'default_folder'
    // Atau Anda bisa memilih untuk menghapus file-file ini juga
    for (f_idx in files.keys()) {
      if (files[f_idx].folder == name) {
        files[f_idx].folder := "default_folder"; // Ubah ke folder default
        // Alternatif: Untuk menghapus file:
        // files := Array.filter(files, func(f) { return f.folder != name; });
        // owners := Array.filter(owners, func(o_idx, o) { return files.keys().contains(o_idx); }); // Perlu logika yang lebih kompleks
      }
    }
  };
}