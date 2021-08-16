import React from "react";
import APIConfig from "../../APIConfig";
import CustomizedTables from "../../components/Table";
import classes from "./styles.module.css";
import { withRouter } from "react-router-dom";
import { Button, Form, Card, Table } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import 'bootstrap/dist/css/bootstrap.min.css';
import authHeader from '../../services/auth-header';


const initState = {
    orderTarget: null,
    file: null,
}

class OrderAndDoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],
            file: null,
            isError: false,
            noPO: "",
            orderName: "",
            clientName: "",
            clientOrg: "",
            projectInstallation: false,
            managedService: false,
            isFiltered: false,
            isFailed: false,
            isSuccess: false,
            messageError: null,
            ordersFiltered: []
        };
        this.handleLookUpDetail = this.handleLookUpDetail.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleAfterError = this.handleAfterError.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleCloseNotif = this.handleCloseNotif.bind(this);
 
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const listOrder  = await APIConfig.get("/orderList", { headers: authHeader() });
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

    handleCloseNotif(){
        this.setState({ isFailed: false, messageError: null });
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
        this.props.history.push(`/dokumen/order/finance/${order.idOrder}`);
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
        const { orders, isError, isFiltered, ordersFiltered } = this.state;

        const tableHeaders = [
            'No', 
            'Nomor PO', 
            'Nama Order', 
            'Nama Pelanggan', 
            'Perusahaan Pelanggan',
            'Tanggal Masuk',
            'Jenis', 
            'Status Verifikasi', 
            'Aksi',
        ];

        const tableRows = isFiltered ? ordersFiltered.map((order) => [order.noPO, order.orderName, order.clientName, order.clientOrg,
                        this.getDate(order.dateOrder), this.checkTypeOrder(order.projectInstallation, order.managedService), 
                        this.checkStatusOrder(order.verified),
                        <div className="d-flex justify-content-center align-items-center">
                        <Button className={classes.button1} onClick={() => this.handleLookUpDetail(order)}>Lihat Dokumen</Button>
                        </div>])
                        : orders.map((order) => [order.noPO, order.orderName, order.clientName, order.clientOrg,
                        this.getDate(order.dateOrder), this.checkTypeOrder(order.projectInstallation, order.managedService), 
                        this.checkStatusOrder(order.verified),
                        <div className="d-flex justify-content-center align-items-center">
                        <Button className={classes.button1} onClick={() => this.handleLookUpDetail(order)}>Lihat Dokumen</Button>
                        </div>]);

        return (
            <div className={classes.container}>
            <div className="content">
            <br></br>
            <h1 className="text-center">Daftar Order</h1>
            <br></br>
            <div className="d-flex justify-content-between" style={{padding: 5}}>
                <div className={classes.search}><Form.Control type="text" size="sm" placeholder="Cari..." onChange={this.handleFilter}/></div>
            </div>
            <br></br>
            <CustomizedTables headers={tableHeaders} rows={tableRows} />

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

export default withRouter(OrderAndDoc);