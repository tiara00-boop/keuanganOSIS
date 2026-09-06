const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbzypxg2ti_YBkUhR1nfkan9yoOMOXx4ZGuIGzNdTgDT58csVgWlxtBFl5meegENrJbhKQ/exec";

const loginModal =
    document.getElementById("loginModal");

const loginForm =
    document.getElementById("loginForm");

const formTransaksiBox =
    document.getElementById("formTransaksiBox");

const loginButton =
    document.getElementById("loginButton");

let adminToken =
    sessionStorage.getItem("adminToken");

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


function bukaLogin() {
    loginModal.style.display = "flex";
}

function tutupLogin() {
    loginModal.style.display = "none";
}

function updateLoginUI() {

    if (adminToken) {

        formTransaksiBox.style.display = "block";

        loginButton.innerHTML =
            '<i class="fa-solid fa-right-from-bracket"></i> Logout';

        loginButton.onclick = logoutAdmin;

    } else {

        formTransaksiBox.style.display = "none";

        loginButton.innerHTML =
            '<i class="fa-solid fa-lock"></i> Login Admin';

        loginButton.onclick = bukaLogin;
    }
}

function formatRupiah(angka) {

    return "Rp " +
        Number(angka || 0)
            .toLocaleString("id-ID");

}

loginForm.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const response =
                await fetch(
                    WEB_APP_URL,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            action: "login",
                            username: username,
                            password: password
                        })
                    }
                );

            const result =
                await response.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            adminToken = result.token;

            sessionStorage.setItem(
                "adminToken",
                adminToken
            );

            loginForm.reset();

            tutupLogin();

            updateLoginUI();

            alert("Login admin berhasil.");

        } catch (error) {

            console.error(error);

            alert("Login gagal. Periksa koneksi.");

        }
    }
);

function logoutAdmin() {

    sessionStorage.removeItem("adminToken");

    adminToken = null;

    updateLoginUI();

    alert("Anda telah logout.");
}

// ==============================
// FORMAT INPUT NOMINAL
// ==============================

nominalInput.addEventListener(
    "input",
    function () {

        let angka =
            this.value.replace(/\D/g, "");

        if (angka === "") {

            this.value = "";

            return;
        }

        this.value =
            Number(angka)
                .toLocaleString("id-ID");

    }
);


// ==============================
// SUBMIT TRANSAKSI
// ==============================

form.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const tanggal =
            document.getElementById("tanggal").value;

        const jenis =
            document.getElementById("jenis").value;

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


        // Validasi

        if (!tanggal) {

            alert("Tanggal harus diisi.");

            return;
        }


        if (!nominal || nominal <= 0) {

            alert("Nominal harus lebih dari 0.");

            return;
        }


        if (!keterangan) {

            alert("Keterangan harus diisi.");

            return;
        }


        let pemasukan = 0;

        let pengeluaran = 0;


        if (jenis === "Pemasukan") {

            pemasukan = nominal;

        } else {

            pengeluaran = nominal;

        }


        // Ubah tombol menjadi loading

        submitButton.disabled = true;

        submitButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';


        try {

            const response =
                await fetch(
                    WEB_APP_URL,
                    {
                        method: "POST",

                        body: JSON.stringify({

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


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Gagal menyimpan data."
                );

            }


            alert("Transaksi berhasil disimpan.");


            // Reset form

            form.reset();


            // Ambil ulang data
            // dari Google Sheets

            await ambilData();


        } catch (error) {

            console.error(error);

            alert(
                "Gagal menyimpan transaksi.\n\n" +
                error.message
            );

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                '<i class="fa-solid fa-plus"></i> Tambah Data';

        }

    }
);


// ==============================
// AMBIL DATA
// ==============================

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
            await fetch(WEB_APP_URL);


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                data.message ||
                "Format data tidak valid."
            );

        }


        // Kosongkan tabel

        tbody.innerHTML = "";


        // Belum ada transaksi

        if (data.length === 0) {

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


        let nomor = 1;

        let saldoTerakhir = 0;


        data.forEach(row => {

            const tanggal =
                formatTanggal(row[0]);

            const keterangan =
                row[1] || "";

            const pemasukan =
                Number(row[2]) || 0;

            const pengeluaran =
                Number(row[3]) || 0;

            const saldoData =
                Number(row[4]) || 0;


            saldoTerakhir =
                saldoData;


            const baris =
                document.createElement("tr");


            // No

            const nomorCell =
                baris.insertCell();

            nomorCell.innerText =
                nomor;


            // Tanggal

            const tanggalCell =
                baris.insertCell();

            tanggalCell.innerText =
                tanggal;


            // Keterangan

            const keteranganCell =
                baris.insertCell();

            keteranganCell.innerText =
                keterangan;


            // Pemasukan

            const masukCell =
                baris.insertCell();


            if (pemasukan > 0) {

                masukCell.innerText =
                    formatRupiah(pemasukan);

                masukCell.classList.add(
                    "pemasukan-text"
                );

            } else {

                masukCell.innerText = "-";

            }


            // Pengeluaran

            const keluarCell =
                baris.insertCell();


            if (pengeluaran > 0) {

                keluarCell.innerText =
                    formatRupiah(pengeluaran);

                keluarCell.classList.add(
                    "pengeluaran-text"
                );

            } else {

                keluarCell.innerText = "-";

            }


            // Saldo

            const saldoCell =
                baris.insertCell();


            saldoCell.innerText =
                formatRupiah(saldoData);


            tbody.appendChild(baris);


            nomor++;

        });


        // Update saldo

        saldoEl.innerText =
            formatRupiah(saldoTerakhir);


    } catch (error) {

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


// ==============================
// FORMAT TANGGAL
// ==============================

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


// ==============================
// JALANKAN SAAT HALAMAN DIBUKA
// ==============================

window.addEventListener(
    "load",
    function () {

        updateLoginUI();

        ambilData();

    }
);