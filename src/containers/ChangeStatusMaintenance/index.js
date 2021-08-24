import React, { Component } from "react";
import APIConfig from "../../APIConfig";
import CustomizedTables from "../../components/Table";
import CustomizedButtons from "../../components/Button";
import Modal from "../../components/Modal";
import { Form, Button, Card, Table  } from "react-bootstrap";
import classes from "../LaporanInstalasiMaintenance/styles.module.css";
import authHeader from "../../services/auth-header";

class ChangeStatusMaintenance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ordersVerified: [],
            listPi: [],
            listMs: [],
            listMaintenance: [],
            orderFiltered: [],
            maintenanceFiltered: [],
            isFiltered: false,
            isLoading: false,
            isEdit: false,
            isSubmitted: false,
            isErrorMsClosed: false,
            isErrorPiClosed: false,
            orderTarget: null,
            statusMaintenances: [],
            statusMs: "",
            statusPi: "",
            maintenanceTarget: null,
            statusMaintenance: ""

        };
        this.handleEdit = this.handleEdit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleChangeField = this.handleChangeField.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleErrorMsClosed = this.handleErrorMsClosed.bind(this);
        this.handleErrorPiClosed = this.handleErrorPiClosed.bind(this);
        this.handleSubmitted = this.handleSubmitted.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const orders = await APIConfig.get("/ordersVerified", { headers: authHeader() } );
            const listPi = await APIConfig.get("/orders/pi", { headers: authHeader() });
            const listMs = await APIConfig.get("/orders/ms", { headers: authHeader() });
            const listMaintenance = await APIConfig.get("/maintenances", { headers: authHeader() });
            // const services = await APIConfig.get("/services");
            this.setState({ ordersVerified: orders.data, listPi: listPi.data, listMs: listMs.data, listMaintenance: listMaintenance.data});
            console.log(listMaintenance)
        } catch (error) {
            alert("Oops terjadi masalah pada server");
            console.log(error);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        // console.log(this.state.orderTarget);
        try {
            let maintenance = this.state.maintenanceTarget;
            let booleanStatus = false;
            console.log(this.state.statusMaintenance)
            if (this.state.statusMaintenance === "Maintained"){
                booleanStatus = true;
            }
            console.log(booleanStatus)
            const dataMaintenance = {
                idMaintenance: maintenance.idMaintenance,
                dateMn: maintenance.dateMn,
                maintained: booleanStatus
            }
            await APIConfig.put(`/maintenance/${maintenance.idMaintenance}/updateStatus`, dataMaintenance, { headers: authHeader() });
            this.handleSubmitted(event, this.state.maintenanceTarget)
            this.setState({isEdit: false});
            await this.loadData()

        } catch (error) {
            alert("Perubahan status order gagal disimpan");
            // this.setState({ isError: true });
            console.log(error);
        }
    }

    handleErrorMsClosed(event) {
        event.preventDefault();
        this.setState({isErrorMsClosed: true});
    }

    handleErrorPiClosed(event) {
        event.preventDefault();
        this.setState({isErrorPiClosed: true});
    }

    handleSubmitted(event, maintenance) {
        event.preventDefault();
        this.setState({isSubmitted: true, maintenanceTarget: maintenance});
    }

    // Mengambil order jenis project installation yang dipilih
    getPi(idOrder){
        let pi = this.state.listPi.filter(pi => pi.idOrder.idOrder === idOrder );

        if (pi.length !== 0) {
            return pi[0];
        }
        return null;
    }

    // Mengambil order jenis managed services yang dipilih
    getMs(idMaintenance){
        console.log(this.state.listMs)
        let listMs = this.state.listMs;
        let listMaintenance;
        for (let i = 0; i < listMs.length; i++){
            listMaintenance = listMs[i].listMaintenance;
            for (let j = 0; j < listMaintenance.length; j++) {
                if (listMaintenance[j].idMaintenance === idMaintenance){
                    return listMs[i];
                }
            }
        }
        return null;
    }

    checkTypeOrder(pi, ms){
        if(pi === true && ms === true){
            return "Project Installation, Managed Service";
        }else if(pi === true){
            return "Project Installation";
        }else if(ms === true){
            return "Managed Service";
        }
    }

    checkStatus(maintenance){
        if (maintenance.maintained === true) {
            return "Maintained";
        }
        return "Not Maintained";
    }

    checkMaintainedForRender(maintenance){
        if (maintenance.maintained === true) {
            return "Maintenance has already been maintained";
        } else {
            return(
                <Button
                    className={classes.button1}
                    onClick={() => this.handleEdit(maintenance)}>
                    Ubah
                </Button>
            );
        }




    }

    handleEdit(maintenance) {
        this.setState({isEdit: true, maintenanceTarget: maintenance, statusMaintenance: this.checkStatus(maintenance)});
    }

    // Menyaring list maintenance sesuai dengan data yang dimasukkan pada form search
    handleFilter(event){
        let newMaintenanceList = this.state.listMaintenance;
        const { value } = event.target;
        if( value !== "" ){
            newMaintenanceList = this.state.listMaintenance.filter(maintenance => {
                return (this.getDate(maintenance.dateMn).toLowerCase().includes(value.toLowerCase()) ||
                    this.getMs(maintenance.idMaintenance).idOrder.noPO.toLowerCase().includes(value.toLowerCase()))
            });
            this.setState({ isFiltered : true });
        }else{
            this.setState({ isFiltered : false });
        }
        this.setState({ maintenanceFiltered : newMaintenanceList });
    }

    getDate(date) {
        let oldDate = new Date(date);
        const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return oldDate.getDate() + " " + month[oldDate.getMonth()] + " " + oldDate.getFullYear();

    }

    handleCancel(event) {
        event.preventDefault();
        this.setState({
            isEdit: false,
            isErrorMsClosed: false,
            isErrorPiClosed: false,
            isSubmitted: false
        });
    }

    handleChangeField(event) {
        const { name, value } = event.target;
        console.log(name)
        console.log(value)
        this.setState({ [name]: value});
    }

    render() {
        const {
            ordersVerified,
            isEdit,
            isErrorMsClosed,
            isErrorPiClosed,
            isSubmitted,
            orderTarget,
            statusMaintenances,
            statusMs,
            statusPi,
            listMaintenance,
            statusMaintenance,
            maintenanceTarget,
            maintenanceFiltered,
            isFiltered
        } = this.state;
        const tableHeaders = ['No.', 'Nomor PO', 'Tanggal Maintenance', 'Status','Aksi'];
        const tableRows = isFiltered ? maintenanceFiltered.map((maintenance, index) => [
            this.getMs(maintenance.idMaintenance).idOrder.noPO,
            this.getDate(maintenance.dateMn),
            this.checkStatus(maintenance),
            this.checkMaintainedForRender(maintenance)
        ])
        : listMaintenance.map((maintenance, index) => [
                this.getMs(maintenance.idMaintenance).idOrder.noPO,
                this.getDate(maintenance.dateMn),
                this.checkStatus(maintenance),
                this.checkMaintainedForRender(maintenance)
            ])
        ;


        return (
            <div className={classes.container}>
                <h1 className="text-center">Daftar Maintenance</h1>
                <div className="d-flex justify-content-end" style={{padding: 5}}>
                    <div className={classes.search}><Form.Control type="text" size="sm" placeholder="Cari..." onChange={this.handleFilter}/></div>
                </div>
                <CustomizedTables headers={tableHeaders} rows={tableRows}/>
                <Modal show={isEdit} handleCloseModal={this.handleCancel}>
                    <div><h3 id='titleform' >Form Ubah Status Maintenance</h3></div>
                    {maintenanceTarget !== null ?
                        <><Form>
                            <table>
                                <tr>
                                    <td>Id Maintenance</td>
                                    <td>: {maintenanceTarget.idMaintenance}</td>
                                </tr>
                                <tr>
                                    <td>Nomor PO</td>
                                    <td>: {this.getMs(maintenanceTarget.idMaintenance).idOrder.noPO}</td>
                                </tr>
                                <tr>
                                    <td>Tanggal Maintenance</td>
                                    <td>: {this.getDate(maintenanceTarget.dateMn)}</td>
                                </tr>
                                <tr>
                                    <td>Status</td>
                                    <td><Form.Control
                                        as="select"
                                        size="lg"
                                        name="statusMaintenance"
                                        value={ this.state.statusMaintenance }
                                        onChange={this.handleChangeField}>
                                        <option value="Not Maintained">Not Maintained</option>
                                        <option value="Maintained">Maintained</option>
                                    </Form.Control></td>
                                </tr>
                            </table>
                            <div style={{alignItems:'right'}}>
                                <Button className={classes.button1} onClick={this.handleSubmit}>
                                    Simpan
                                </Button>
                            </div>
                        </Form></>
                        : <></> }
                </Modal>
                <Modal show={isSubmitted} handleCloseModal={this.handleCancel}>
                    {maintenanceTarget !== null ? <>
                        <div>
                            <h3 id='titleform' >
                                Status Maintenance untuk tanggal  {this.getDate(maintenanceTarget.dateMn)} berhasil diubah menjadi
                                {" " + this.state.statusMaintenance}

                            </h3>
                        </div></> : <></>}
                    <div style={{alignItems:'right'}}>
                        <Button className={classes.button1} onClick={this.handleCancel}>
                            Ok
                        </Button>
                    </div>
                </Modal>
            </div>
        )
    }


}

export default ChangeStatusMaintenance;