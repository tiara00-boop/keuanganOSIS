const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbzypxg2ti_YBkUhR1nfkan9yoOMOXx4ZGuIGzNdTgDT58csVgWlxtBFl5meegENrJbhKQ/exec";


const form =
    document.getElementById("formKeuangan");

const tbody =
    document.getElementById("dataTransaksi");

const saldoEl =
    document.getElementById("saldo");

const nominalInput =
    document.getElementById("nominal");

const submitButton =
    document.getElementById("submitButton");

const loginModal =
    document.getElementById("loginModal");

const loginForm =
    document.getElementById("loginForm");

const formTransaksiBox =
    document.getElementById("formTransaksiBox");

const loginButton =
    document.getElementById("loginButton");

const filterBulan =
    document.getElementById("filterBulan");


let adminToken =
    sessionStorage.getItem("adminToken");


let semuaData = [];


// =========================
// FORMAT RUPIAH
// =========================

function formatRupiah(angka) {

    return "Rp " +
        Number(angka || 0)
            .toLocaleString("id-ID");
}


// =========================
// FORMAT TANGGAL
// =========================

function formatTanggal(value) {

    if (!value) {
        return "-";
    }

    const tanggal =
        new Date(value);

    if (isNaN(tanggal)) {
        return value;
    }

    return tanggal.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


// =========================
// UPDATE LOGIN
// =========================

function updateLoginUI() {

    if (adminToken) {

        formTransaksiBox.style.display =
            "block";

        loginButton.innerHTML =
            '<i class="fa-solid fa-right-from-bracket"></i> Logout';

        loginButton.onclick =
            logoutAdmin;

    } else {

        formTransaksiBox.style.display =
            "none";

        loginButton.innerHTML =
            '<i class="fa-solid fa-lock"></i> Login Admin';

        loginButton.onclick =
            bukaLogin;
    }
}


// =========================
// BUKA LOGIN
// =========================

function bukaLogin() {

    loginModal.style.display =
        "flex";
}


// =========================
// TUTUP LOGIN
// =========================

function tutupLogin() {

    loginModal.style.display =
        "none";
}


// =========================
// LOGIN
// =========================

loginForm.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const button =
            loginForm.querySelector("button");


        button.disabled = true;


        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa...';


        try {

            const response =
                await fetch(
                    WEB_APP_URL,
                    {
                        method:"POST",

                        body:JSON.stringify({

                            action:"login",

                            username:
                                username,

                            password:
                                password
                        })
                    }
                );


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Login gagal."
                );
            }


            adminToken =
                result.token;


            sessionStorage.setItem(
                "adminToken",
                adminToken
            );


            loginForm.reset();

            tutupLogin();

            updateLoginUI();


            alert(
                "Login admin berhasil."
            );


        } catch(error) {

            console.error(
                "Login error:",
                error
            );


            alert(
                error.message ||
                "Login gagal."
            );


        } finally {

            button.disabled =
                false;


            button.innerHTML =
                '<i class="fa-solid fa-right-to-bracket"></i> Login';
        }
    }
);


// =========================
// LOGOUT
// =========================

function logoutAdmin() {

    sessionStorage.removeItem(
        "adminToken"
    );

    adminToken = null;

    updateLoginUI();

    alert(
        "Anda telah logout."
    );
}


// =========================
// FORMAT NOMINAL
// =========================

nominalInput.addEventListener(
    "input",
    function() {

        let angka =
            this.value.replace(
                /\D/g,
                ""
            );


        if (angka === "") {

            this.value = "";

            return;
        }


        this.value =
            Number(angka)
                .toLocaleString("id-ID");
    }
);


// =========================
// TAMBAH TRANSAKSI
// =========================

form.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        if (!adminToken) {

            alert(
                "Silakan login sebagai admin terlebih dahulu."
            );

            bukaLogin();

            return;
        }


        const tanggal =
            document
                .getElementById("tanggal")
                .value;


        const jenis =
            document
                .getElementById("jenis")
                .value;


        const nominal =
            Number(
                nominalInput.value
                    .replace(/\./g, "")
            );


        const keterangan =
            document
                .getElementById("keterangan")
                .value
                .trim();


        if (!tanggal) {

            alert(
                "Tanggal harus diisi."
            );

            return;
        }


        if (
            !nominal ||
            nominal <= 0
        ) {

            alert(
                "Nominal harus lebih dari 0."
            );

            return;
        }


        if (!keterangan) {

            alert(
                "Keterangan harus diisi."
            );

            return;
        }


        let pemasukan = 0;

        let pengeluaran = 0;


        if (
            jenis === "Pemasukan"
        ) {

            pemasukan =
                nominal;

        } else {

            pengeluaran =
                nominal;
        }


        submitButton.disabled =
            true;


        submitButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';


        try {

            const response =
                await fetch(
                    WEB_APP_URL,
                    {
                        method:"POST",

                        body:JSON.stringify({

                            action:
                                "transaksi",

                            token:
                                adminToken,

                            tanggal:
                                tanggal,

                            keterangan:
                                keterangan,

                            pemasukan:
                                pemasukan,

                            pengeluaran:
                                pengeluaran
                        })
                    }
                );


            const result =
                await response.json();


            console.log(
                "Response transaksi:",
                result
            );


            if (!result.success) {

                if (
                    result.message ===
                    "Anda harus login sebagai admin."
                ) {

                    sessionStorage.removeItem(
                        "adminToken"
                    );

                    adminToken = null;

                    updateLoginUI();
                }


                throw new Error(
                    result.message ||
                    "Gagal menyimpan transaksi."
                );
            }


            alert(
                "Transaksi berhasil disimpan."
            );


            form.reset();


            await ambilData();


        } catch(error) {

            console.error(
                "Transaksi error:",
                error
            );


            alert(
                error.message ||
                "Gagal menyimpan transaksi."
            );


        } finally {

            submitButton.disabled =
                false;


            submitButton.innerHTML =
                '<i class="fa-solid fa-plus"></i> Tambah Data';
        }
    }
);


// =========================
// FILTER BULAN
// =========================

filterBulan.addEventListener(
    "change",
    function() {

        tampilkanData();
    }
);


// =========================
// TAMPILKAN DATA
// =========================

function tampilkanData() {

    tbody.innerHTML = "";


    if (
        semuaData.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Belum ada transaksi.
                </td>
            </tr>
        `;


        saldoEl.innerText =
            formatRupiah(0);

        return;
    }


    const filter =
        filterBulan.value;


    let dataTampil =
        semuaData;


    // FILTER BULAN

  if (filter !== "all") {

    const periode =
        Number(filter);

    dataTampil =
        semuaData.filter(row => {

            if (!row[0]) {
                return false;
            }

            const tanggal =
                new Date(row[0]);

            if (isNaN(tanggal)) {
                return false;
            }

            const tahun =
                tanggal.getFullYear();

            const bulan =
                tanggal.getMonth();

            /*
             * Periode OSIS:
             * 0  = September 2026
             * 1  = Oktober 2026
             * 2  = November 2026
             * 3  = Desember 2026
             * 4  = Januari 2027
             * ...
             * 11 = Agustus 2027
             */

            let periodeTanggal;

            if (
                tahun === 2026 &&
                bulan >= 8
            ) {
                // September - Desember 2026
                periodeTanggal =
                    bulan - 8;

            } else if (
                tahun === 2027 &&
                bulan <= 7
            ) {
                // Januari - Agustus 2027
                periodeTanggal =
                    bulan + 4;

            } else {
                return false;
            }

            return periodeTanggal === periode;
        });
}


    // TIDAK ADA DATA BULAN TERSEBUT

    if (
        dataTampil.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Tidak ada transaksi pada bulan ini.
                </td>
            </tr>
        `;


        // Saldo keseluruhan tetap ditampilkan

        const saldoTerakhir =
            Number(
                semuaData[
                    semuaData.length - 1
                ][4]
            ) || 0;


        saldoEl.innerText =
            formatRupiah(
                saldoTerakhir
            );

        return;
    }


    let nomor = 1;


    dataTampil.forEach(
        row => {

            const tanggal =
                formatTanggal(
                    row[0]
                );


            const keterangan =
                row[1] || "";


            const pemasukan =
                Number(row[2]) || 0;


            const pengeluaran =
                Number(row[3]) || 0;


            const saldoData =
                Number(row[4]) || 0;


            const baris =
                document.createElement(
                    "tr"
                );


            // NO

            baris.insertCell()
                .innerText =
                nomor;


            // TANGGAL

            baris.insertCell()
                .innerText =
                tanggal;


            // KETERANGAN

            baris.insertCell()
                .innerText =
                keterangan;


            // PEMASUKAN

            const masukCell =
                baris.insertCell();


            if (
                pemasukan > 0
            ) {

                masukCell.innerText =
                    formatRupiah(
                        pemasukan
                    );

                masukCell.classList.add(
                    "pemasukan-text"
                );

            } else {

                masukCell.innerText =
                    "-";
            }


            // PENGELUARAN

            const keluarCell =
                baris.insertCell();


            if (
                pengeluaran > 0
            ) {

                keluarCell.innerText =
                    formatRupiah(
                        pengeluaran
                    );

                keluarCell.classList.add(
                    "pengeluaran-text"
                );

            } else {

                keluarCell.innerText =
                    "-";
            }


            // SALDO

            baris.insertCell()
                .innerText =
                formatRupiah(
                    saldoData
                );


            tbody.appendChild(
                baris
            );


            nomor++;
        }
    );


    // SALDO KESELURUHAN

    const saldoTerakhir =
        Number(
            semuaData[
                semuaData.length - 1
            ][4]
        ) || 0;


    saldoEl.innerText =
        formatRupiah(
            saldoTerakhir
        );
}


// =========================
// AMBIL DATA DARI SHEET
// =========================

async function ambilData() {

    tbody.innerHTML = `
        <tr>
            <td colspan="6">
                Memuat data...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                WEB_APP_URL
            );


        const data =
            await response.json();


        console.log(
            "Data dari server:",
            data
        );


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                data.message ||
                "Format data tidak valid."
            );
        }


        semuaData =
            data;


        tampilkanData();


    } catch(error) {

        console.error(
            "Gagal mengambil data:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Gagal memuat data.
                </td>
            </tr>
        `;
    }
}


// =========================
// SAAT WEBSITE DIBUKA
// =========================

window.addEventListener(
    "load",
    function() {

        updateLoginUI();

        ambilData();
    }
);
