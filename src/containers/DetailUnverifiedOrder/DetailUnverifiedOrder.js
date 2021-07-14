import React from "react";
import APIConfig from "../../APIConfig";
import CustomizedButtons from "../../components/Button";
import classes from "./styles.module.css";
import Order from "../../components/Order/orderDetail";
import ProjectInstallation from "../../components/ProjectInstallation/piDetail";
import ManagedService from "../../components/ManagedService/msDetail";
import { withRouter } from "react-router-dom";
import CustomizedTables from "../../components/Table";
//import Modal from "../../components/Modal";
import ServiceList from "../../components/Services/serviceList";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import * as moment from "moment";
import { store } from "react-notifications-component";
import ReactNotification from "react-notifications-component";
import authHeader from '../../services/auth-header';

const initState = {
    name: "",
}

class DetailUnverifiedOrder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idOrder: this.props.match.params.id,
            idOrderPi: "",
            idOrderMs: "",
            ordersPI: [],
            ordersMS: [],
            orderTarget: null,
            noPO: "",
            noSPH: "",
            orderName: "",
            description: "",
            projectInstallation: false,
            managedService: false,
            startPI: "",
            deadline:"",
            close: false,
            percentage: 0.0,
            actualStart: "",
            actualEnd: "",
            activated: false,
            listService: [],
            clientName: "",
            clientDiv: "",
            clientPIC: "",
            clientOrg: "",
            clientPhone: "",
            clientEmail: "",
            dateOrder: "",
            verified: false,
            idService: "",
            name: "",
            serviceTarget: null,
            listServiceNew: [{ index: Math.random(), name: ""}],
            documents: [],
            documentTarget: null,
            isError: false,
        }
        this.handleLookDetail = this.handleLookDetail.bind(this);
        this.handleLookService = this.handleLookService.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleAfterError = this.handleAfterError.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const listOrderPI  = await APIConfig.get("/orders/pi", { headers: authHeader() });
            const listOrderMS  = await APIConfig.get("/orders/ms", { headers: authHeader() });
            const orderItem  = await APIConfig.get(`/order/detail/${this.state.idOrder}`, { headers: authHeader() });
            const docList = await APIConfig.get(`/order/${this.state.idOrder}/documents`, { headers: authHeader() }); //doc order
            this.setState({ ordersPI: listOrderPI.data });
            this.setState({ ordersMS: listOrderMS.data });
            this.setState({ orderTarget: orderItem.data });
            this.setState({ documents: docList.data }); //doc order
            this.handleLookDetail();
        } catch (error) {
            this.setState({ isError: true });
            //alert("Oops terjadi masalah pada server");
            console.log(error);
        }
    }

    getPIorder(idOrder) {
        let pi = this.state.ordersPI.filter(pi => pi.idOrder.idOrder === idOrder);
        if (pi.length !== 0) {
            return pi[0];
        }
        return null;
    }

    getMSorder(idOrder) {
        let ms = this.state.ordersMS.filter(ms => ms.idOrder.idOrder === idOrder);
        if (ms.length !== 0) {
            return ms[0];
        }
        return null;
    }

    checkTypeOrder(pi, ms) {
        if(pi === true && ms === true){
            return "Project Installation, Managed Service";
        }else if(pi === true){
            return "Project Installation";
        }else if(ms === true){
            return "Managed Service";
        }
    }

    checkStatusOrder(verif) {
        if(verif === true){
            return "Verified";
        }else {
            return "Not Verified";
        }
    }

    checkActivatedMS(active) {
        if(active === true){
            return "Activated";
        } else {
            return "Not Activated";
        }
    }

    checkClosedPI(close) {
        if(close === true){
            return "Closed";
        } else {
            return "Not Closed";
        }
    }

    getDate(date) {
        let oldDate = new Date(date);
        const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return oldDate.getDate() + " " + month[oldDate.getMonth()] + " " + oldDate.getFullYear();

    }

    handleBack = () => {
        this.props.history.push(`/order/status/verification`);
    }

    handleLookDetail() {
        let order = this.state.orderTarget;
        this.setState({
            noPO: order.noPO,
            noSPH: order.noSPH,
            orderName: order.orderName,
            description: order.description,
            projectInstallation: order.projectInstallation,
            managedService: order.managedService,
            clientName: order.clientName,
            clientDiv: order.clientDiv,
            clientPIC: order.clientPIC,
            clientOrg: order.clientOrg,
            clientPhone: order.clientPhone,
            clientEmail: order.clientEmail,
            dateOrder: order.dateOrder,
            verified: order.verified,
        })
        let isPI = order.projectInstallation;
        let isMS = order.managedService;
        if (isPI === true) {
            const ordPI = this.getPIorder(order.idOrder);
            this.setState({
                idOrderPi: ordPI.idOrderPi,
                startPI: ordPI.startPI,
                deadline: ordPI.deadline,
                close: ordPI.close,
                percentage: ordPI.percentage,
            });
        }
        if (isMS === true) {
            const ordMS = this.getMSorder(order.idOrder);
            this.setState({
                idOrderMs: ordMS.idOrderMs,
                actualStart: ordMS.actualStart,
                actualEnd: ordMS.actualEnd,
                activated: ordMS.activated,
            });
            this.handleLookService();
        }
    }

    handleAfterError = () => {
        this.props.history.push(`/order/verification`);
        this.setState({ isError: false });
    }

    async handleLookService() {
        try {
            const services = await APIConfig.get(`/order/MS/${this.state.idOrderMs}/listService`,{ headers: authHeader() });
            this.setState({ listService: services.data });
        } catch (error) {
            this.setState({ isError: true });
            //alert("Oops terjadi masalah pada server");
            console.log(error);
        }
    }

    handleCancel(event) {
        event.preventDefault();
        this.setState({ isChangeService: false, isAddService: false, isDelete: false, isDeleteService: false, ...initState });
    }

    noCancelChange(event){
        event.preventDefault()
        this.setState({ isCancelChangeService: false });
    }

    getUrl(document){

        const BASE_URL = "https://propen-a01-sipel.herokuapp.com/order/document/";
		// const BASE_URL = "http://localhost:2020/order/document/";
        if(document.fileType === "application/pdf"){
            return BASE_URL+document.docName+"/preview";
        }else{
            return BASE_URL+document.docName;
        }
    }

    render() {
        const {
            name,
            isDelete,
            isError,
            isDeleteSuccess,
            isDeleteService,
            isCancelChangeService,
            isCancelToAddService,
        } = this.state;

        let { listService } = this.state;

        let { listServiceNew } = this.state;

        let { documents } = this.state; //doc order

        const tableHeaders = [
            'No', 'Nama Service'
        ];

        const tableRows = listService.map((service) => [<div className="d-flex justify-content-center align-items-center">{service.name}</div>
        ]);

        const tableHeadersDoc = ['No', 'Nama Dokumen', 'Tanggal Upload', 'Aksi'];

        const tableRowsDoc = documents.map((document) => [
            <div className="d-flex justify-content-center align-items-center">{document.docName}</div>,
            <div className="d-flex justify-content-center align-items-center">{this.getDate(document.uploadedDate)}</div>,
            <div className="d-flex justify-content-center align-items-center">
            <Button className={classes.button1} href={this.getUrl(document)} target = "_blank">Preview</Button>
            </div>]);

        return (
            <div className={classes.container}>
            <div className="content">
            <br></br>
            <h1 className={classes.title}>Detail Order</h1>
            <br></br>
            <div className="row" style={{ marginTop: 10 }}>
                <div className="col-sm-1"></div>
                <div className="col-sm-10">
                    <div className="card">
                        <div className="card-body">
                            <Order 
                                key={this.state.idOrder}
                                idOrder={this.state.idOrder}
                                noPO={this.state.noPO}
                                noSPH={this.state.noSPH}
                                orderName={this.state.orderName}
                                description={this.state.description}
                                clientName={this.state.clientName}
                                clientDiv={this.state.clientDiv}
                                clientPIC={this.state.clientPIC}
                                clientOrg={this.state.clientOrg}
                                clientPhone={this.state.clientPhone}
                                clientEmail={this.state.clientEmail}
                                dateOrder={this.getDate(this.state.dateOrder)}
                                verified={this.checkStatusOrder(this.state.verified)}
                                jenis={this.checkTypeOrder(this.state.projectInstallation, this.state.managedService)}
                            />
                        </div>
                        <div className="card-body">
                            {this.state.projectInstallation 
                            ? 
                            <>
                            <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <h3 className={classes.subtitle}>Detail Data Project Installation</h3>
                                </div>
                            </div>
                            </div>
                            <ProjectInstallation 
                                key={this.state.idOrderPi}
                                idOrderPi={this.state.idOrderPi}
                                startPI={this.getDate(this.state.startPI)}
                                deadline={this.getDate(this.state.deadline)}
                                percentage={this.state.percentage}
                                close={this.checkClosedPI(this.state.close)} /><br></br>
                            </>
                            : 
                                <></>
                            }
                            {this.state.managedService
                            ? 
                            <>
                            <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <h3 className={classes.subtitle}>Detail Data Managed Service</h3>
                                </div>
                            </div>
                            </div>
                            <ManagedService 
                                key={this.state.idOrderMs}
                                idOrderMs={this.state.idOrderMs}
                                actualStart={this.getDate(this.state.actualStart)}
                                actualEnd={this.getDate(this.state.actualEnd)}
                                activated={this.checkActivatedMS(this.state.activated)}/>
                            <br></br>
                            <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <h3 className={classes.subtitle}>Daftar Services</h3>
                                </div>
                            </div>
                            </div>
                            <br></br>
                            <CustomizedTables headers={tableHeaders} rows={tableRows} /><br></br>
                            </>
                            : <></> }
                            {/* doc order */}
                            <br></br>
                            <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <h3 className={classes.subtitle}>Daftar Dokumen Order</h3>
                                </div>
                            </div>
                            </div>
                            <CustomizedTables headers={tableHeadersDoc} rows={tableRowsDoc} /><br></br>
                        </div>
                        <div className="card-footer text-right">
                            <Button className={classes.button1} onClick={() => this.handleBack()}>&nbsp;Kembali&nbsp;</Button>
                        </div>
                    </div>
                </div>
            </div>

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
                            <Button className={classes.button1} onClick={() => this.handleAfterError()}>Kembali</Button>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
            </div>
        );
    }
}

export default withRouter(DetailUnverifiedOrder);