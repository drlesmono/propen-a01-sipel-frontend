import React from "react";
import APIConfig from "../../APIConfig";
import CustomizedTables from "../../components/Table";
import classes from "./styles.module.css";
import { withRouter } from "react-router-dom";
import { Button, Form, Card, Table } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import authHeader from '../../services/auth-header';


const initState = {
    orderTarget: null,
    file: null,
}

class UnverifiedOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],
            orderTarget: null,
            file: null,
            isError: false,
            noPO: "",
            orderName: "",
            clientName: "",
            clientOrg: "",
            projectInstallation: false,
            managedService: false,
            isFiltered: false,
            isEditStatus: false,
            isFailed: false,
            isVerified: false,
            flag: "",
            isSuccess: false,
            messageError: null,
            ordersFiltered: []
        };
        this.handleLookUpDetail = this.handleLookUpDetail.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleAfterError = this.handleAfterError.bind(this);
        this.handleVerification = this.handleVerification.bind(this);
        this.handleValidation = this.handleValidation.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleChangeField = this.handleChangeField.bind(this);
        this.handleCloseNotif = this.handleCloseNotif.bind(this);
 
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const listOrder  = await APIConfig.get("/unverifiedOrders", { headers: authHeader() });
            this.setState({ orders: listOrder.data });
        } catch (error) {
            this.setState({ isError: true });
            alert("Oops terjadi masalah pada server");
            console.log(error);
        }
    }


    handleCancel(event) {
        event.preventDefault();
        this.setState({
            isError: false,
            noPO: "",
            orderName: "",
            clientName: "",
            clientOrg: "",
            projectInstallation: false,
            managedService: false,
            isFiltered: false,
            isVerified: false,
            isFailed: false,
            messageError: null,
            flag: "",
            isSuccess: false,
            orderTarget: null,
            isEditStatus: false
            
        });
        this.loadData();
    }

    checkTypeOrder(pi, ms) {
        if(pi === true && ms === true){
            return <div>Project Installation<br></br>Managed Service</div>;
        }else if(pi === true){
            return "Project Installation";
        }else if(ms === true){
            return "Managed Service";
        }
    }

    handleVerification(order) {
        this.setState({ isEditStatus: true, orderTarget: order });
    }

    handleCloseNotif(){
        this.setState({ isFailed: false, messageError: null });
    }

    handleChangeField= (event) => {
        this.setState({flag: event.target.value});
    }

    handleValidation(event){
        event.preventDefault();
        console.log('flag ' + JSON.stringify(this.state.flag));
        if(this.state.flag === ""){
            return this.setState({isFailed: true, messageError: "Status Verifikasi wajib dipilih"});
        }
        this.handleSave(event);
    }

    handleSave = (e) => {
        e.preventDefault();
        if (this.state.flag === "Pending"){
            let order = {idOrder: this.state.orderTarget.idOrder, isVerified: false};
            console.log('order => ' + JSON.stringify(order));
            const URL = "http://localhost:2020/api/v1/order/status/verification";
            axios.put(URL, order, { headers: authHeader() });
            this.setState({
            isSuccess: true});
        }

        if (this.state.flag === "Verified"){
            let order = {idOrder: this.state.orderTarget.idOrder, isVerified: true};
            console.log('order => ' + JSON.stringify(order));
            const URL = "http://localhost:2020/api/v1/order/status/verification";
            axios.put(URL, order, { headers: authHeader() });
            this.setState({
            isSuccess: true});
        }
        
    }

    checkStatusOrder(verif){
        if(verif === true){
            return "Verified";
        }else {
            return "Pending";
        }
    }

    getDate(date) {
        let oldDate = new Date(date);
        const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return oldDate.getDate() + " " + month[oldDate.getMonth()] + " " + oldDate.getFullYear();

    }

    handleLookUpDetail = (order) => {
        this.props.history.push(`/order/verification/detail/${order.idOrder}`);
    }

    handleAfterError = () => {
        this.setState({ isError: false });
    }

    handleFilter(event){
        let newOrders = this.state.orders;
        const { value } = event.target;
        if( value !== "" ){
            newOrders = this.state.orders.filter(order => {
                return (order.orderName.toLowerCase().includes(value.toLowerCase()) || 
                order.noPO.toLowerCase().includes(value.toLowerCase()) ||
                order.clientName.toLowerCase().includes(value.toLowerCase()) ||
                order.clientOrg.toLowerCase().includes(value.toLowerCase()) ||
                this.getDate(order.dateOrder).toLowerCase().includes(value.toLowerCase()) ||
                this.checkStatusOrder(order.verified).toLowerCase().includes(value.toLowerCase()))
            });
            this.setState({ isFiltered : true });
        }else{
            this.setState({ isFiltered : false });
        }
        this.setState({ ordersFiltered : newOrders });
    }

    render() {
        const { orders, orderTarget, isSuccess, flag, isVerified, isError, isFiltered, ordersFiltered, isEditStatus, isFailed, messageError } = this.state;

        const tableHeaders = [
            'No', 
            'Nomor PO', 
            'Nama Order', 
            'Nama Pelanggan', 
            'Perusahaan Pelanggan',
            'Tanggal Masuk',
            'Jenis', 
            'Status', 
            'Aksi',
        ];

        const tableRows = isFiltered ? ordersFiltered.map((order) => [order.noPO, order.orderName, order.clientName, order.clientOrg,
                        this.getDate(order.dateOrder), this.checkTypeOrder(order.projectInstallation, order.managedService), 
                        this.checkStatusOrder(order.verified),
                        <div className="d-flex justify-content-center align-items-center">
                        <Button className={classes.button1} onClick={() => this.handleLookUpDetail(order)}>Detail</Button>
                        <Button className={classes.button5} onClick={() => this.handleVerification(order)} style={{marginLeft: "5px"}}>Verifikasi</Button>
                        </div>])
                        : orders.map((order) => [order.noPO, order.orderName, order.clientName, order.clientOrg,
                        this.getDate(order.dateOrder), this.checkTypeOrder(order.projectInstallation, order.managedService), 
                        this.checkStatusOrder(order.verified),
                        <div className="d-flex justify-content-center align-items-center">
                        <Button className={classes.button1} onClick={() => this.handleLookUpDetail(order)}>Detail</Button>
                        <Button className={classes.button5} onClick={() => this.handleVerification(order)} style={{marginLeft: "5px"}}>Verifikasi</Button>
                        </div>]);

        return (
            <div className={classes.container}>
            <div className="content">
            <br></br>
            <h1 className="text-center">Daftar Order Belum Terverifikasi</h1>
            <br></br>
            <div className="d-flex justify-content-between" style={{padding: 5}}>
                <div className={classes.search}><Form.Control type="text" size="sm" placeholder="Cari..." onChange={this.handleFilter}/></div>
            </div>
            <br></br>
            <CustomizedTables headers={tableHeaders} rows={tableRows} />

            <Modal
                    show={isEditStatus}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                    <Modal.Header closeButton onClick={this.handleCancel}>
                        
                    <Modal.Title id="contained-modal-title-vcenter">
                        Ubah Status Verifikasi
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
                            <p>
                                <Form>
                                    <Table borderless responsive="xl" size="sm">
                                        <tr>
                                            <td><p className="d-flex">Pilih Status<p style={{color: "red"}}>*</p></p></td>
                                            <td>
                                                <Form.Control
                                                as="select"
                                                size="lg"
                                                name="flag"
                                                value={ this.state.value }
                                                onChange={this.handleChangeField}>
                                                <option value="">Belum Pilih</option>
                                                <option value="Verified">Verified</option>
                                                <option value="Pending">Pending</option>
                                                </Form.Control>   
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{color: "red"}}>*Wajib dipilih</td>
                                            <td className="d-flex justify-content-end">
                                                    <Button variant="primary" className={classes.button1} onClick={this.handleValidation}>
                                                        Simpan
                                                    </Button>
                                            </td>
                                        </tr>
                                    </Table>
                                </Form>
                            </p>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={isSuccess}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                     <Modal.Header closeButton onClick={this.handleCancel}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Notification
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                                <br></br>
                                <div className="d-flex justify-content-center"><strong>{"Status verifikasi order berhasil diubah menjadi " + this.state.flag} </strong></div><br></br>
                                <div className="d-flex justify-content-center">
                                </div> 
                                <div className="d-flex justify-content-center">
                                <Button className="btn btn-success" onClick={this.handleCancel}>Kembali</Button>
                                </div>
                                <br></br>
                                                        
                    </Modal.Body>
                </Modal>


            <Modal show={isError} dialogClassName="modal-90w" aria-labelledby="contained-modal-title-vcenter">
                <Modal.Header>
                    <div className="text-center">
                        <h4>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Oops terjadi masalah pada server!
                        <br></br>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Harap coba beberapa saat lagi</h4>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <Button className={classes.button2} onClick={() => this.handleAfterError()}>Kembali</Button>
                    </div>
                </Modal.Body>
            </Modal>
            </div>
            </div>
        );
    }
}

export default withRouter(UnverifiedOrders);