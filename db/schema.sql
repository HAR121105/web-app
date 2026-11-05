-- BAGIAN 1: akun, pelanggan, menu
DROP TABLE IF EXISTS pelanggan, menu, akun CASCADE;

CREATE TABLE akun (
    id_akun       SERIAL       PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    role          VARCHAR(10)  NOT NULL
                  CHECK (role IN ('owner','pelanggan','kasir','kitchen'))
);

CREATE TABLE pelanggan (
    id_pelanggan  VARCHAR(10)  PRIMARY KEY,
    id_akun       INT          NOT NULL UNIQUE REFERENCES akun(id_akun),
    nama          VARCHAR(100) NOT NULL,
    tanggal_lahir DATE,
    no_telepon    VARCHAR(15),
    email         VARCHAR(100) UNIQUE
);

CREATE TABLE menu (
    id_menu       VARCHAR(10)  PRIMARY KEY,
    nama_menu     VARCHAR(100) NOT NULL,
    kategori_menu VARCHAR(50)  NOT NULL,
    harga_satuan  INT          NOT NULL CHECK (harga_satuan > 0)
);

INSERT INTO akun (username, password_hash, role) VALUES ('adzra', 'HASH_DUMMY', 'pelanggan');
INSERT INTO pelanggan VALUES ('PLG001', 1, 'Adzra', '2005-04-12', '081234561231', 'zhafira@gmail.com');
INSERT INTO menu VALUES
 ('MNU001', 'Donat Gula Halus',    'Donat Klasik',  4000),
 ('MNU002', 'Donat Cokelat Meses', 'Donat Topping', 4000),
 ('MNU003', 'Donat Keju',          'Donat Topping', 5000);