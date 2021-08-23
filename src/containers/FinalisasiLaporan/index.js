import React, { Component } from "react";
import APIConfig from "../../APIConfig";
import CustomizedTables from "../../components/Table";
import { Form, Button, Card, Table } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import 'bootstrap/dist/css/bootstrap.min.css';
import classes from "./styles.module.css";
import authHeader from "../../services/auth-header";
import jsPDF from "jspdf";

class FinalisasiLaporan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ordersVerified: [],
            reports: [],
            listIr: [],
            listMr: [],
            listPi: [],
            listMs: [],
            listMaintenance: [],
            listBast: [],
            reportsFiltered: [],
            termList: [],
            orderList:[],
            isInstallationReport: false,
            isMaintenanceReport: false,
            isBastReport: false,
            isMrUploaded: false,
            isBastUploaded: false,
            isUpload: false,
            isReadyToFinalize: false,
            isDelete: false,
            isSuccess: false,
            isDeleteSuccess: false,
            isFailed: false,
            isError: false,
            reportTarget: null,
            orderTarget: null,
            irTarget: null,
            mrTarget: null,
            bastTarget: null,
            dateHandover: null,
            startPeriod: null,
            endPeriod: null,
            maintenanceBast: null,
            orderByPOBast: null,
            bastPi: false,
            bastMaintenance: false,
            maintenanceTarget: null,
            orderByPO: null,
            file: null,
            notes: null,
            isValid: true,
            messageError: null,
            perPage: 20,
            currentPageNumber: 1,
            reportNum: null,
            reportType: null
        };
        this.handleChangeField = this.handleChangeField.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.handleMrUpload = this.handleMrUpload.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleCloseNotif = this.handleCloseNotif.bind(this);
        this.handleCancelMrUpload = this.handleCancelMrUpload.bind(this);
        this.handleCancelBastUpload = this.handleCancelBastUpload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeFile = this.handleChangeFile.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleValidation = this.handleValidation.bind(this);
        this.handleValidationMrUpload = this.handleValidationMrUpload.bind(this);
        this.handleValidationBastUpload = this.handleValidationBastUpload.bind(this);
        this.handleFinalize = this.handleFinalize.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const orders = await APIConfig.get("/ordersVerifiedReport", { headers: authHeader() });
            const order = await APIConfig.get("/laporan/order", { headers: authHeader() });
            const reports = await APIConfig.get("/reports/all", { headers: authHeader() });
            const listIr = await APIConfig.get("/reports/ir", { headers: authHeader() });
            const listMr = await APIConfig.get("/reports/mr", { headers: authHeader() });
            const listPi = await APIConfig.get("/orders/pi", { headers: authHeader() });
            const listMs = await APIConfig.get("/orders/ms", { headers: authHeader() });
            const listBast = await APIConfig.get("/laporan/bast", { headers: authHeader() });
            const listTerm = await APIConfig.get("/orders/ms/perc", { headers: authHeader() });
            console.log(listBast.data)
            const reportsSigned = reports.data.filter(report => report.signed === true);
            this.setState({ ordersVerified: orders.data, reports: reportsSigned, listIr: listIr.data,
                listMr: listMr.data, listPi: listPi.data, listMs: listMs.data, listBast: listBast.data,
                termList: listTerm.data, orderList: order.data, perPage: this.setPerPage(reportsSigned.length)});
        } catch (error) {
            this.setState({ isError: true, messageError: "Oops terjadi masalah pada server" });
            console.log(error);
        }
    }

    // Mengatur maksimal list yang ditampilkan
    setPerPage(length){
        console.log(length)
        let perPage = 20;
        const multiple = Math.floor(length / 500);
        if(multiple === 0){
            return perPage;
        }else{
            return perPage * multiple;
        }
    }

    // Mengirim data yang akan disimpan ke backend
    async handleSubmit(event) {
        event.preventDefault();

        try {
            let response;
            let newReport;

            const dataReport = new FormData();
            dataReport.append("statusApproval", "pending");
            dataReport.append("signed", false)
            dataReport.append("reportType", this.state.reportType );
            dataReport.append("file", this.state.file);
            response = await APIConfig.post(`/report/finalize`, dataReport, { headers: authHeader() });
            newReport = response.data.result;

            // let notes = this.state.notes;
            // if(notes !== null){
            //     notes = "Admin : " + this.state.notes;
            // }

            // Apabila report berjenis installation, maka masuk ke if
            // Apabila report berjenis maintenance, maka masuk ke else
            if(this.state.isInstallationReport){
                const dataInstallationReport = {
                    idInstallationReport: null,
                    irNum: null,
                    notes: "Admin : Laporan Instalasi telah difinalisasi",
                    idOrderPi: this.getPi(parseInt(this.state.orderByPO, 10)).idOrderPi
                }
                await APIConfig.post(`/report/${newReport.idReport}/installation/finalize`, dataInstallationReport, { headers: authHeader() });
            }else if(this.state.isMaintenanceReport){
                const dataMaintenanceReport = {
                    idMaintenanceReport: null,
                    mrNum: null,
                    notes: "Admin : Laporan Maintenance telah difinalisasi",
                    idMaintenance: parseInt(this.state.maintenanceTarget, 10)
                }
                await APIConfig.post(`/report/${newReport.idReport}/maintenance/finalize`, dataMaintenanceReport, { headers: authHeader() });
            } else if (this.state.bastPi){
                const dataBastReport = {
                    idBast: null,
                    bastNum: null,
                    dateHandover: this.state.dateHandover,
                    startPeriod: this.state.startPeriod,
                    endPeriod: this.state.endPeriod,
                    notes: "Admin : BAST telah difinalisasi",
                    idMaintenance: null,
                    idOrderMs: null,
                    idOrderPi: this.getPi(parseInt(this.state.orderByPOBast, 10)).idOrderPi
                }
                console.log(dataBastReport);
                await APIConfig.post(`/report/${newReport.idReport}/bast/finalize`, dataBastReport, { headers: authHeader() });

            } else if (this.state.bastMaintenance){
                const dataBastReport = {
                    idBast: null,
                    bastNum: null,
                    dateHandover: this.state.dateHandover,
                    startPeriod: this.state.startPeriod,
                    endPeriod: this.state.endPeriod,
                    notes: "Admin : BAST telah difinalisasi",
                    idMaintenance: parseInt(this.state.maintenanceBast, 10),
                    idOrderMs: null,
                    idOrderPi: null
                }
                console.log(dataBastReport);
                await APIConfig.post(`/report/${newReport.idReport}/bast/finalize`, dataBastReport, { headers: authHeader() });


            }


            this.setState({reportTarget: newReport});
        } catch (error) {
            console.log(error);
            return this.setState({isUpload: false, isMrUploaded:false, isInstallationReport: false, isError: true, messageError: "Oops terjadi masalah pada server"});
        }
        this.setState({isSuccess: true, isUpload: false, isMrUploaded:false, isBastUpload: false, isInstallationReport: false});
        this.loadData();
    }

    handleValidation(event){
        event.preventDefault();

        if(this.state.orderByPO === null || this.state.orderByPO === ""){
            return this.setState({isFailed: true, messageError: "Nomor PO wajib diisi"});
        }

        if(this.state.file === null || this.state.file === ""){
            return this.setState({isFailed: true, messageError: "File wajib diisi"});
        }

        if(this.state.isBastReport === true){
            if (this.state.bastPi === false && this.state.bastMaintenance === false){
                return this.setState({isFailed: true, messageError: "Jenis BAST wajib dipilih"});
            }
        }


        this.setState({isFailed: false, messageError: null});
        if(this.state.isMaintenanceReport === true){
            return this.handleMrUpload(event);
        } else if (this.state.isBastReport === true){
            return this.handleBastUpload(event);
        }
        this.handleSubmit(event);
    }

    handleValidationMrUpload(event){
        event.preventDefault();
        if(this.state.maintenanceTarget === null || this.state.maintenanceTarget === ""){
            return this.setState({isFailed: true, messageError: "Tanggal maintenance wajib diisi"});
        }
        this.handleSubmit(event);
    }

    handleValidationBastUpload(event){
        event.preventDefault();
        if (this.state.bastPi){
            if (this.state.dateHandover === null || this.state.dateHandover === ""){
                return this.setState({isFailed: true, messageError: "Tanggal Penyerahan wajib diisi"});
            }
        } else {
            if (this.state.maintenanceBast === null || this.state.maintenanceBast === ""){
                return this.setState({isFailed: true, messageError: "Tanggal Maintenance wajib diisi"});
            }
            if (this.state.dateHandover === null || this.state.dateHandover === ""){
                return this.setState({isFailed: true, messageError: "Tanggal Penyerahan wajib diisi"});
            }
            if (this.state.startPeriod === null || this.state.startPeriod === ""){
                return this.setState({isFailed: true, messageError: "Periode Awal Maintenance wajib diisi"});
            }
            if (this.state.endPeriod === null || this.state.endPeriod === ""){
                return this.setState({isFailed: true, messageError: "Periode Akhir Maintenance wajib diisi"});
            }
        }
        this.handleSubmit(event);
    }

    async handleDelete(event){
        event.preventDefault();
        try{
            await APIConfig.delete(`/report/${this.state.reportTarget.idReport}/delete`, { headers: authHeader() });
        }catch (error){
            console.log(error);
            return this.setState({isFailed: true, messageError: "Laporan gagal dihapus"});
        }
        this.loadData();
        return this.setState({isDeleteSuccess: true, isDelete: false});
    }

    handleChangeField(event) {
        event.preventDefault();
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    handleChangeFile(event){
        event.preventDefault();
        this.setState({[event.target.name]: event.target.files[0]});
    }

    getOrder(report){
        if(report.reportType === "installation"){
            const ir = this.getIr(report.idReport);
            if(ir !== null){
                const pi = ir.idOrderPi;
                return pi.idOrder;
            }
        }else if(report.reportType === "maintenance"){
            const mr = this.getMr(report.idReport);
            if(mr !== null){
                const maintenanceTarget = mr.idMaintenance;
                for(let i=0; i<this.state.listMs.length; i++){
                    if(this.state.listMs[i].listMaintenance !== null){
                        const listMaintenance = this.state.listMs[i].listMaintenance.filter(maintenance =>
                            maintenance.idMaintenance === maintenanceTarget.idMaintenance);
                        if(listMaintenance.length !== 0){
                            const ms = this.state.listMs[i];
                            return ms.idOrder;
                        }
                    }
                }
            }
        } else if(report.reportType === "BAST"){
            const bast = this.getBast(report.idReport);
            if (bast !== null){
                if (bast.idOrderPi !== null){
                    const idPi = bast.idOrderPi;
                    return this.getPiFromIdOrderPi(idPi).idOrder;
                }
                if (bast.idMaintenance !== null){
                    const maintenanceTarget = bast.idMaintenance;
                    for(let i=0; i<this.state.listMs.length; i++){
                        if(this.state.listMs[i].listMaintenance !== null){
                            const listMaintenance = this.state.listMs[i].listMaintenance.filter(maintenance =>
                                maintenance.idMaintenance === maintenanceTarget);
                            if(listMaintenance.length !== 0){
                                const ms = this.state.listMs[i];
                                return ms.idOrder;
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    // Mengambil order jenis project installation yang dipilih
    getPi(idOrder){
        let pi = this.state.listPi.filter(pi => pi.idOrder.idOrder === idOrder );

        if (pi.length !== 0) {
            return pi[0];
        }
        return null;
    }

    getPiFromIdOrderPi(idOrderPi){
        let pi = this.state.listPi.filter(pi => pi.idOrderPi === idOrderPi );

        if (pi.length !== 0) {
            return pi[0];
        }
        return null;
    }

    // Mengambil order jenis managed services yang dipilih
    getMs(idOrder){
        let ms = this.state.listMs.filter(ms => ms.idOrder.idOrder === idOrder);

        if (ms.length !== 0) {
            return ms[0];
        }
        return null;
    }

    getIr(idReport){
        let ir = this.state.listIr.filter(ir => ir.idReport.idReport === idReport);
        if (ir.length !== 0) {
            return ir[0];
        }
        return null;
    }

    getMr(idReport){
        let mr = this.state.listMr.filter(mr => mr.idReport.idReport === idReport);
        if (mr.length !== 0) {
            return mr[0];
        }
        return null;
    }

    getBast(idReport){
        let bast = this.state.listBast.filter(bast => bast.idReport === idReport);
        if (bast.length !== 0) {
            return bast[0];
        }
        return null;
    }


    getReportNum(report){
        if(report.reportType === "installation"){
            if(this.getIr(report.idReport) !== null){
                return this.getIr(report.idReport).irNum;
            }
        }else if(report.reportType === "maintenance"){
            if(this.getMr(report.idReport) !== null){
                return this.getMr(report.idReport).mrNum;
            }
        } else if(report.reportType === "BAST"){
            if(this.getBast(report.idReport) !== null){
                return this.getBast(report.idReport).bastNum;
            }
        }
        return null;
    }

    handleUpload(type){
        if (type === "installation") {
            this.setState({isInstallationReport: true, reportType: type})
        }
        if (type === "maintenance") {
            this.setState({isMaintenanceReport: true, reportType: type})
        }
        if (type === "BAST") {
            this.setState({isBastReport: true, reportType: type})
        }
        this.setState({isUpload: true, isReadyToFinalize: false});
        console.log(this.state.isReadyToFinalize);
        console.log(this.state.reportTarget);

    }

    handleMrUpload(event){
        event.preventDefault();
        const ms = this.getMs(parseInt(this.state.orderByPO, 10));
        this.setState({listMaintenance: ms.listMaintenance, isUpload: false, isInstallationReport: false, isMrUploaded: true});
    }

    handleBastUpload(event){
        event.preventDefault();
        const ms = this.getMs(parseInt(this.state.orderByPO, 10));
        if (ms === null) {
            this.setState({isUpload: false, isInstallationReport: false, isBastUploaded: true, orderByPOBast: this.state.orderByPO});
        } else {
            this.setState({listMaintenance: ms.listMaintenance, isUpload: false, isInstallationReport: false, isBastUploaded: true});
        }
    }

    handleCancel(event) {
        event.preventDefault();
        this.setState({
            listMaintenance: [],
            isInstallationReport: false,
            isMaintenanceReport: false,
            isBastReport: false,
            isMrUploaded: false,
            isReadyToFinalize: false,
            isUpload: false,
            isDelete: false,
            isSuccess: false,
            isDeleteSuccess: false,
            isFailed: false,
            isError: false,
            reportTarget: null,
            orderTarget: null,
            maintenanceTarget: null,
            orderByPO: null,
            file: null,
            notes: null,
            isValid: true,
            messageError: null,
            isFiltered: false,
            reportNum: null
        });
        this.loadData();
    }

    handleCloseNotif(){
        this.setState({ isFailed: false });
    }

    handleConfirmDelete(report){
        const reportNum = this.getReportNum(report);
        this.setState({reportNum: reportNum, reportTarget: report, isDelete: true, orderTarget: this.getOrder(report)});
    }

    handleCancelMrUpload(){
        this.setState({isMrUploaded: false, isUpload: true});
    }

    handleCancelBastUpload(){
        this.setState({isBastUploaded: false, isUpload: true});
    }

    handleFinalize(report) {
        this.setState({
            isReadyToFinalize: true,
            reportTarget: report
        });
        console.log(this.state.isReadyToFinalize);
        console.log(this.state.reportTarget);

    }

    // Mendapatkan url sesuai dengan jenis file
    // Apabila jenis file adalah pdf, maka url preview yang digunakan
    // Apabila jenis file selain pdf, maka url download yang digunakan
    getUrl(report){
        const BASE_URL = "https://propen-a01-sipel.herokuapp.com/report/";
        // const BASE_URL = "https://propen-a01-sipel.herokuapp.com/report/";
        if(report.fileType === "application/pdf"){
            return BASE_URL+report.reportName+"/preview";
        }else{
            return BASE_URL+report.reportName;
        }
    }

    getToDownload(report){
        const BASE_URL = "http://propen-a01-sipel.herokuapp.com/report/";
        // const BASE_URL = "https://propen-a01-sipel.herokuapp.com/report/";
        return BASE_URL+report.reportName;
    }

    // Mengambil catatan untuk report
    getNotes(report){
        let notes="";
        if(report.reportType === "installation"){
            const ir = this.getIr(report.idReport);
            if(ir !== null){
                if(ir.notes !== null){
                    let splitNotes=ir.notes.split(' ');
                    if(splitNotes.length > 7){
                        for(let i=0; i<7; i++){
                            notes = notes + splitNotes[i] + " ";
                        }
                        return <div>{notes}... <a style={{color: "red"}} onClick={() => this.handleOpenNotes(ir.notes)}>more</a></div>;
                    }

                    return <div>{ir.notes}</div>;
                }
            }
        }else if (report.reportType === "maintenance"){
            const mr = this.getMr(report.idReport);
            if(mr !== null){
                if(mr.notes !== null){
                    let splitNotes=mr.notes.split(' ');
                    if(splitNotes.length > 7){
                        for(let i=0; i<7; i++){
                            notes = notes + splitNotes[i] + " ";
                        }
                        return <div>{notes}... <a style={{color: "red"}} onClick={() => this.handleOpenNotes(mr.notes)}>more</a></div>;
                    }

                    return <div>{mr.notes}</div>;
                }
            }
        } else {
            console.log("masuk sini")
            const bast = this.getBast(report.idReport);
            console.log(bast)
            if(bast !== null){
                if(bast.notes !== null){
                    console.log(bast.notes)
                    let splitNotes=bast.notes.split(' ');
                    if(splitNotes.length > 7){
                        for(let i=0; i<7; i++){
                            notes = notes + splitNotes[i] + " ";
                        }
                        return <div>{notes}... <a style={{color: "red"}} onClick={() => this.handleOpenNotes(bast.notes)}>more</a></div>;
                    }

                    return <div>{bast.notes}</div>;
                }
            }
        }

        return <div>-</div>;
    }

    // Mengambil data dengan format "tanggal bulan(dalam huruf abjad) tahun"
    getDate(value){
        let date = new Date(value);

        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        return date.getDate()+" "+monthNames[date.getMonth()]+" "+date.getFullYear();
    }

    // Memunculkan modal notes
    handleOpenNotes(notes){
        let splitNotes=notes.split(':');
        this.setState({ isNotes: true, role: splitNotes[0], notes: splitNotes[1] });
    }

    // Menyaring order sesuai dengan jenisnya
    getListOrderFilter(){
        if(this.state.isInstallationReport){
            return this.state.ordersVerified.filter(order => order.projectInstallation === true);
        }else if (this.state.isMaintenanceReport){
            return this.state.ordersVerified.filter(order => order.managedService === true);
        } else {
            return this.state.ordersVerified;
        }
    }

    getListOrderPi(){
        return this.state.ordersVerified.filter(order => order.projectInstallation === true);
    }

    // Menyaring list report sesuai dengan data yang dimasukkan pada form search
    handleFilter(event){
        let newReportList = this.state.reports;
        const { value } = event.target;

        if( value !== "" ){
            newReportList = this.state.reports.filter(report => {
                return (report.reportName.toLowerCase().includes(value.toLowerCase()) ||
                    this.getReportNum(report).toLowerCase().includes(value.toLowerCase()))
            });
            this.setState({ isFiltered : true });
        }else{
            this.setState({ isFiltered : false, currentPageNumber : 1 });
        }
        this.setState({ reportsFiltered : newReportList });
    }

    // Menghandle page number yang di click
    handlePageClick(event){
        const { id } = event.target;
        this.setState({ currentPageNumber: Number(id) });
    }


    render() {
        const {
            reports,
            reportsFiltered,
            isMrUploaded,
            isBastUploaded,
            isInstallationReport,
            isMaintenanceReport,
            isBastReport,
            isUpload,

            isReadyToFinalize,
            isSuccess,
            isDelete,
            isDeleteSuccess,
            isFailed,
            isError,
            bastTarget,
            dateHandover,
            startPeriod,
            endPeriod,
            maintenanceBast,
            orderByPOBast,
            bastPi,
            bastMaintenance,
            listMaintenance,
            reportTarget,
            messageError,
            isFiltered,
            reportNum,
            currentPageNumber,
            perPage
        } = this.state;
        const lastIndex = currentPageNumber * perPage;
        const firstIndex = lastIndex - perPage;
        const currentPage = isFiltered ? reportsFiltered.slice(firstIndex, lastIndex) : reports.slice(firstIndex, lastIndex);

        const tableHeaders = [
            'No.',
            'Nomor Dokumen',
            'Nama Laporan',
            'Nomor PO',
            'Perusahaan',
            'Jenis Laporan',
            'Catatan',
            'Aksi',
        ];
        let tableRows = [];

        if(currentPage.length !== 0){
            // console.log(reports)
            tableRows = isFiltered ? currentPage.map((report) =>
                    [
                        this.getReportNum(report),
                        report.reportName,
                        this.getOrder(report).noPO,
                        this.getOrder(report).clientOrg,
                        report.reportType,
                        this.getNotes(report),
                        <Table borderless size="sm">
                            <tr>
                                <td><Button className={classes.button2} onClick={() => this.handleConfirmDelete(report)}>Hapus</Button></td>
                                <td><Button className={classes.button4} href={this.getUrl(report)} target = "_blank">Lihat</Button></td>
                                <td><Button className={classes.button2} href={this.getToDownload(report)} target = "_blank">Unduh</Button></td>
                            </tr>
                        </Table>
                    ])
                : currentPage.map((report) =>
                    [
                        this.getReportNum(report),
                        report.reportName,
                        this.getOrder(report).noPO,
                        this.getOrder(report).clientOrg,
                        report.reportType,
                        this.getNotes(report),
                        <Table borderless size="sm">
                            <tr>
                                <td><Button className={classes.button2} onClick={() => this.handleConfirmDelete(report)}>Hapus</Button></td>
                                <td><Button className={classes.button4} href={this.getUrl(report)} target = "_blank">Lihat</Button></td>
                                <td><Button className={classes.button2} href={this.getToDownload(report)} target = "_blank">Unduh</Button></td>
                            </tr>
                        </Table>
                    ]);
        }

        const pageNumber = [];
        for(let i = 1; i <= Math.ceil( (isFiltered ? reportsFiltered.length : reports.length) / perPage) ; i++){
            pageNumber.push(i);
        }

        const renderPageNumber = pageNumber.map(number => {
            return(
                <Button
                    size="sm"
                    key={number}
                    id={number}
                    onClick={this.handlePageClick}
                    className={number === currentPageNumber ? classes.button1 : classes.button3}
                >
                    {number}
                </Button>
            )
        });

        return (
            <div className={classes.container}>
                <div><h1 className="text-center">Daftar Laporan Final</h1></div>
                <div className="d-flex justify-content-between" style={{padding: 5}}>
                    <div className={classes.containerButtonUpload}>
                        <Button size="sm" className={[classes.button1, classes.buttonUpload].join(" ")} onClick={() => this.handleUpload("installation")}>Finalisasi Laporan Instalasi</Button>
                        <span>&nbsp;&nbsp;</span>
                        <Button size="sm" className={[classes.button5, classes.buttonUpload].join(" ")} onClick={() => this.handleUpload("maintenance")}>Finalisasi Laporan Maintenance</Button>
                        <span>&nbsp;&nbsp;</span>
                        <Button size="sm" className={[classes.button1, classes.buttonUpload].join(" ")} onClick={() => this.handleUpload("BAST")}>Finalisasi BAST</Button>
                    </div>
                    <div className={classes.search}><Form.Control type="text" size="sm" placeholder="Cari..." onChange={this.handleFilter}/></div>
                </div>

                <div>{ currentPage.length !== 0 ? <CustomizedTables headers={tableHeaders} rows={tableRows}/> : <p className="text-center" style={{color: "red"}}>Belum terdapat laporan </p>}</div>

                {/* Page Number */}
                <div className={classes.pageNumber} >{renderPageNumber}</div>


                {/* Menampilkan modal berisi form upload report*/}
                <Modal
                    show={isUpload}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                    <Modal.Header closeButton onClick={this.handleCancel}>
                        {isUpload ?
                            <Modal.Title id="contained-modal-title-vcenter">
                                {isInstallationReport ? "Form Unggah Laporan Instalasi" : ""}
                                {isMaintenanceReport ? "Form Unggah Laporan Maintenance" : ""}
                                {isBastReport ? "Form Unggah BAST" : ""}
                            </Modal.Title>
                            : <></>}
                    </Modal.Header>
                    <Modal.Body>
                        { isFailed ?
                            <Card body className={classes.card}>
                                <div className="d-flex justify-content-between">
                                    <div>{messageError}</div>
                                    <Button size="sm" className="bg-transparent border border-0 border-transparent" onClick={this.handleCloseNotif}>x</Button>
                                </div>
                            </Card>
                            : <></> }
                        <p>
                            <Form>
                                <Table borderless responsive="xl" size="sm">
                                    <tr>
                                        <td><p className="d-flex">Nomor PO<p style={{color: "red"}}>*</p></p></td>
                                        <td>
                                            <Form.Control as="select" size="sm" name="orderByPO" onChange={this.handleChangeField}>
                                                <option value='' style={{color: 'gray'}}>Pilih Nomor PO</option>
                                                {this.getListOrderFilter().map((order) =>
                                                    <option value={order.idOrder}>{order.noPO}</option>)
                                                }
                                            </Form.Control></td>
                                    </tr>
                                    <tr>
                                        <td><p className="d-flex">Laporan <p style={{color: "red"}}>*</p></p></td>
                                        <td><Form.File name="file" onChange={this.handleChangeFile}/></td>
                                    </tr>
                                    {isBastReport ?
                                        <div className="col-sm-6">
                                            <p className="d-flex">Jenis BAST<p style={{color: "red"}}>*</p></p>
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    name="bastPi"
                                                    id="bastPi"
                                                    className="form-check-input"
                                                    value={bastPi}
                                                    checked={bastPi}
                                                    onChange={(e) => this.setState(prevState => ({
                                                        bastPi: !prevState.bastPi
                                                    }))} />
                                                <label className="form-check-label" style={{color: "black"}}>BAST Proyek Instalasi</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    name="bastMaintenance"
                                                    id="bastMaintenance"
                                                    className="form-check-input"
                                                    value={bastMaintenance}
                                                    checked={bastMaintenance}
                                                    onChange={(e) => this.setState(prev => ({
                                                        bastMaintenance: !prev.bastMaintenance
                                                    }))} />
                                                <label className="form-check-label" style={{color: "black"}}>BAST Maintenance</label>
                                            </div>
                                        </div>
                                        : <></>}
                                    <tr>
                                        <td style={{color: "red"}}>*Wajib diisi</td>
                                        <td className="d-flex justify-content-end">
                                            <Button variant="primary" className={classes.button1} onClick={this.handleValidation}>
                                                {isInstallationReport ? "Unggah" : "Selanjutnya"}
                                            </Button>
                                        </td>
                                    </tr>
                                </Table>
                            </Form>
                        </p>
                    </Modal.Body>
                </Modal>


                {/* Menampilkan modal berisi form pemilihan maintenance */}
                <Modal
                    show={isMrUploaded}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                    <Modal.Header closeButton onClick={this.handleCancelMrUpload}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Form Pemilihan Maintenance
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { isFailed ?
                            <Card body className={classes.card}>
                                <div className="d-flex justify-content-between">
                                    <div>{messageError}</div>
                                    <Button size="sm" className="bg-transparent border border-0 border-transparent" onClick={this.handleCloseNotif}>x</Button>
                                </div>
                            </Card>
                            : <></> }
                        <Form>
                            <Table borderless responsive="xl" size="sm">
                                <tr>
                                    <td><p className="d-flex">Maintenance<p style={{color: "red"}}>*</p></p></td>
                                    <td><Form.Control as="select" size="sm" name="maintenanceTarget" onChange={this.handleChangeField}>
                                        <option value='' style={{color: 'gray'}}>Pilih Tanggal Maintenance</option>
                                        {listMaintenance.map((maintenance) => <option value={maintenance.idMaintenance}>{this.getDate(maintenance.dateMn)}</option>)}
                                    </Form.Control></td>
                                </tr>
                                <tr>
                                    <td style={{color: "red"}}>*Wajib diisi</td>
                                    <td className="d-flex justify-content-end">
                                        <Button variant="primary" className={classes.button1} onClick={this.handleValidationMrUpload}>
                                            Unggah
                                        </Button>
                                    </td>
                                </tr>
                            </Table>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Menampilkan modal berisi form pengisian data BAST */}
                <Modal
                    show={isBastUploaded}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                    <Modal.Header closeButton onClick={this.handleCancelBastUpload}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Form Pengisian Data BAST
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { isFailed ?
                            <Card body className={classes.card}>
                                <div className="d-flex justify-content-between">
                                    <div>{messageError}</div>
                                    <Button size="sm" className="bg-transparent border border-0 border-transparent" onClick={this.handleCloseNotif}>x</Button>
                                </div>
                            </Card>
                            : <></> }
                        <Form>
                            <Table borderless responsive="xl" size="sm">
                                {bastMaintenance ?
                                    <tr>
                                        <td><p className="d-flex">Maintenance<p style={{color: "red"}}>*</p></p></td>
                                        <td><Form.Control as="select" size="sm" name="maintenanceBast" onChange={this.handleChangeField}>
                                            <option value='' style={{color: 'gray'}}>Pilih Tanggal Maintenance</option>
                                            {listMaintenance.map((maintenance) => <option value={maintenance.idMaintenance}>{this.getDate(maintenance.dateMn)}</option>)}
                                        </Form.Control></td>
                                    </tr>
                                    : <></>}
                                <tr>
                                    <td><p className="d-flex">Tanggal Penyerahan<p style={{color: "red"}}>*</p></p></td>
                                    <td><Form.Control type="date" size="sm" name="dateHandover" className={classes.notes} onChange={this.handleChangeField} placeholder="Tambahkan catatan..."/></td>
                                </tr>
                                {bastMaintenance ?
                                    <tr>
                                        <td><p className="d-flex">Periode Awal Maintenance<p style={{color: "red"}}>*</p></p></td>
                                        <td><Form.Control type="date" size="sm" name="startPeriod" className={classes.notes} onChange={this.handleChangeField} placeholder="Masukkan Tanggal Mulai"/></td>
                                    </tr> : <></>}
                                {bastMaintenance ?
                                    <tr>
                                        <td><p className="d-flex">Periode Akhir Maintenance<p style={{color: "red"}}>*</p></p></td>
                                        <td><Form.Control type="date" size="sm" name="endPeriod" className={classes.notes} onChange={this.handleChangeField} placeholder="Masukkan Tanggal Selesai"/></td>
                                    </tr>
                                    : <></>}
                                <tr>
                                    <td style={{color: "red"}}>*Wajib diisi</td>
                                    <td className="d-flex justify-content-end">
                                        <Button variant="primary" className={classes.button1} onClick={this.handleValidationBastUpload}>
                                            Unggah
                                        </Button>
                                    </td>
                                </tr>
                            </Table>
                        </Form>
                    </Modal.Body>
                </Modal>

            </div>
        );
    }
}

export default FinalisasiLaporan;