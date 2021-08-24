import React, { Component } from "react";
import APIConfig from "../../APIConfig";
import CustomizedTables from "../../components/Table";
import CustomizedButtons from "../../components/Button";
import Modal from "../../components/Modal";
import { Form, Button, Card, Table  } from "react-bootstrap";
import classes from "../LaporanInstalasiMaintenance/styles.module.css";
import authHeader from "../../services/auth-header";

class ChangeStatusOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ordersVerified: [],
            listPi: [],
            listMs: [],
            orderFiltered: [],
            isFiltered: false,
            isLoading: false,
            isEdit: false,
            isSubmitted: false,
            isErrorMsClosed: false,
            isErrorPiClosed: false,
            orderTarget: null,
            statusMaintenances: [],
            statusMs: "",
            statusPi: ""

        };
        this.handleEdit = this.handleEdit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleChangeField = this.handleChangeField.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleErrorMsClosed = this.handleErrorMsClosed.bind(this);
        this.handleErrorPiClosed = this.handleErrorPiClosed.bind(this);
        this.handleSubmitted = this.handleSubmitted.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const orders = await APIConfig.get("/ordersVerified", { headers: authHeader() } );
            const listPi = await APIConfig.get("/orders/pi", { headers: authHeader() });
            const listMs = await APIConfig.get("/orders/ms", { headers: authHeader() });
            // const services = await APIConfig.get("/services");
            this.setState({ ordersVerified: orders.data, listPi: listPi.data, listMs: listMs.data});
            console.log(this.state.ordersVerified)
        } catch (error) {
            alert("Oops terjadi masalah pada server");
            console.log(error);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({isErrorMsClosed: false, isErrorPiClosed: false});
        // console.log(this.state.orderTarget);
        try {
            if(this.state.orderTarget.projectInstallation === true && this.state.orderTarget.managedService === false){
                // console.log(this.state.orderTarget.idOrderPi);
                const pi = this.getPi(this.state.orderTarget.idOrder);
                if (this.state.statusPi === "Closed"){
                    if (pi.percentage === 100){
                        const dataPi = {
                            idOrderPi: pi.idOrderPi,
                            idUserEng: pi.picEngineerPi,
                            percentage: pi.percentage,
                            startPI: pi.startPI,
                            deadline: pi.deadline,
                            dateClosedPI: pi.dateClosedPI,
                            status: this.state.statusPi
                        }
                        // console.log(dataPi);
                        await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/pi/${pi.idOrderPi}/updateStatus`, dataPi, { headers: authHeader() });
                        this.handleSubmitted(event, this.state.orderTarget)
                        this.setState({isEdit: false});
                    } else {
                        this.handleErrorPiClosed(event);
                    }
                } else {
                    const dataPi = {
                        idOrderPi: pi.idOrderPi,
                        idUserEng: pi.picEngineerPi,
                        percentage: pi.percentage,
                        startPI: pi.startPI,
                        deadline: pi.deadline,
                        dateClosedPI: pi.dateClosedPI,
                        status: this.state.statusPi
                    }
                    // console.log(dataPi);
                    await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/pi/${pi.idOrderPi}/updateStatus`, dataPi, { headers: authHeader() });
                    this.handleSubmitted(event, this.state.orderTarget)
                    this.setState({isEdit: false});
                }
            }
            if(this.state.orderTarget.managedService === true && this.state.orderTarget.projectInstallation === false){
                const ms = this.getMs(this.state.orderTarget.idOrder);
                if (this.state.statusMs === "Closed"){
                    const msUpdated = await APIConfig.get(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}`, { headers: authHeader() });
                    // console.log(msUpdated.data.listMaintenance);
                    let statusAllMaintenance = true;
                    let listMaintenanceChecked = msUpdated.data.listMaintenance;
                    for(let i=0; i<listMaintenanceChecked.length; i++){
                        let maintenanceCheck = listMaintenanceChecked[i];
                        if (maintenanceCheck.maintained === false){
                            statusAllMaintenance = false;
                        }
                    }
                    if (statusAllMaintenance === true) {


                        const dataMs = {
                            idOrderMs: ms.idOrderMs,
                            idUserPic: ms.picEngineerMs,
                            actualStart: ms.actualStart,
                            actualEnd: ms.actualEnd,
                            activated: ms.activated,
                            timeRemaining: ms.timeRemaining,
                            dateClosedMS: ms.dateClosedMS,
                            status: this.state.statusMs
                        }
                        // console.log(dataMs);
                        await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/updateStatus`, dataMs, { headers: authHeader() });
                        this.handleSubmitted(event, this.state.orderTarget)
                        this.setState({isEdit: false});
                    } else {
                        this.handleErrorMsClosed(event);
                    }
                } else {
                    const dataMs = {
                        idOrderMs: ms.idOrderMs,
                        idUserPic: ms.picEngineerMs,
                        actualStart: ms.actualStart,
                        actualEnd: ms.actualEnd,
                        activated: ms.activated,
                        timeRemaining: ms.timeRemaining,
                        dateClosedMS: ms.dateClosedMS,
                        status: this.state.statusMs
                    }
                    // console.log(dataMs);
                    await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/updateStatus`, dataMs,{ headers: authHeader() });
                    this.handleSubmitted(event, this.state.orderTarget)
                    this.setState({isEdit: false});
                }

            }
            if(this.state.orderTarget.managedService === true && this.state.orderTarget.projectInstallation === true){
                const pi = this.getPi(this.state.orderTarget.idOrder);
                const ms = this.getMs(this.state.orderTarget.idOrder);
                if (this.state.statusPi === "Closed"){
                    if (pi.percentage === 100){
                        const dataPi = {
                            idOrderPi: pi.idOrderPi,
                            idUserEng: pi.picEngineerPi,
                            percentage: pi.percentage,
                            startPI: pi.startPI,
                            deadline: pi.deadline,
                            dateClosedPI: pi.dateClosedPI,
                            status: this.state.statusPi
                        }
                        // console.log(dataPi);
                        await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/pi/${pi.idOrderPi}/updateStatus`, dataPi, { headers: authHeader() });
                        if (this.state.statusMs !== "Closed") {
                            const dataMs = {
                                idOrderMs: ms.idOrderMs,
                                idUserPic: ms.picEngineerMs,
                                actualStart: ms.actualStart,
                                actualEnd: ms.actualEnd,
                                activated: ms.activated,
                                timeRemaining: ms.timeRemaining,
                                dateClosedMS: ms.dateClosedMS,
                                status: this.state.statusMs
                            }
                            // console.log(dataMs);
                            await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/updateStatus`, dataMs,{ headers: authHeader() });
                            this.handleSubmitted(event, this.state.orderTarget)
                            this.setState({isEdit: false});
                        } else {
                            console.log(ms.idOrderMs)
                            let statusAllMaintenance = true;
                            let listMaintenanceChecked = ms.listMaintenance;
                            for(let i=0; i<listMaintenanceChecked.length; i++){
                                let maintenanceCheck = listMaintenanceChecked[i];
                                if (maintenanceCheck.maintained === false){
                                    statusAllMaintenance = false;
                                }
                            }
                            console.log(statusAllMaintenance)
                            if (statusAllMaintenance === true){
                                const dataMs = {
                                    idOrderMs: ms.idOrderMs,
                                    idUserPic: ms.picEngineerMs,
                                    actualStart: ms.actualStart,
                                    actualEnd: ms.actualEnd,
                                    activated: ms.activated,
                                    timeRemaining: ms.timeRemaining,
                                    dateClosedMS: ms.dateClosedMS,
                                    status: this.state.statusMs
                                }
                                // console.log(dataMs);
                                await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/updateStatus`, dataMs, { headers: authHeader() });
                                this.handleSubmitted(event, this.state.orderTarget)
                                this.setState({isEdit: false});
                            } else {
                                this.handleErrorMsClosed(event);
                            }
                        }
                    } else {
                        this.handleErrorPiClosed(event);
                    }
                }
                if (this.state.statusMs === "Closed"){
                    const msUpdated = await APIConfig.get(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}`, { headers: authHeader() });
                    // console.log(msUpdated.data.listMaintenance);
                    let statusAllMaintenance = true;
                    let listMaintenanceChecked = msUpdated.data.listMaintenance;
                    for(let i=0; i<listMaintenanceChecked.length; i++){
                        let maintenanceCheck = listMaintenanceChecked[i];
                        if (maintenanceCheck.maintained === false){
                            statusAllMaintenance = false;
                        }
                    }
                    if (statusAllMaintenance === true) {
                        const dataMs = {
                            idOrderMs: ms.idOrderMs,
                            idUserPic: ms.picEngineerMs,
                            actualStart: ms.actualStart,
                            actualEnd: ms.actualEnd,
                            activated: ms.activated,
                            timeRemaining: ms.timeRemaining,
                            dateClosedMS: ms.dateClosedMS,
                            status: this.state.statusMs
                        }
                        // console.log(dataMs);
                        await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/updateStatus`, dataMs, { headers: authHeader() });
                        if (this.state.statusPi !== "Closed") {
                            const dataPi = {
                                idOrderPi: pi.idOrderPi,
                                idUserEng: pi.picEngineerPi,
                                percentage: pi.percentage,
                                startPI: pi.startPI,
                                deadline: pi.deadline,
                                dateClosedPI: pi.dateClosedPI,
                                status: this.state.statusPi
                            }
                            // console.log(dataPi);
                            await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/pi/${pi.idOrderPi}/updateStatus`, dataPi, { headers: authHeader() });
                            this.handleSubmitted(event, this.state.orderTarget)
                            this.setState({isEdit: false});
                        } else {
                            if (pi.percentage === 100){
                                const dataPi = {
                                    idOrderPi: pi.idOrderPi,
                                    idUserEng: pi.picEngineerPi,
                                    percentage: pi.percentage,
                                    startPI: pi.startPI,
                                    deadline: pi.deadline,
                                    dateClosedPI: pi.dateClosedPI,
                                    status: this.state.statusPi
                                }
                                // console.log(dataPi);
                                await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/pi/${pi.idOrderPi}/updateStatus`, dataPi, { headers: authHeader() });
                                this.handleSubmitted(event, this.state.orderTarget)
                                this.setState({isEdit: false});
                            } else {
                                this.handleErrorPiClosed(event)
                            }
                        }
                    } else {
                        this.handleErrorMsClosed(event);
                    }
                }
                if (this.state.statusMs !== "Closed" && this.state.statusPi !== "Closed" ) {
                    const dataPi = {
                        idOrderPi: pi.idOrderPi,
                        idUserEng: pi.picEngineerPi,
                        percentage: pi.percentage,
                        startPI: pi.startPI,
                        deadline: pi.deadline,
                        dateClosedPI: pi.dateClosedPI,
                        status: this.state.statusPi
                    }
                    const dataMs = {
                        idOrderMs: ms.idOrderMs,
                        idUserPic: ms.picEngineerMs,
                        actualStart: ms.actualStart,
                        actualEnd: ms.actualEnd,
                        activated: ms.activated,
                        timeRemaining: ms.timeRemaining,
                        dateClosedMS: ms.dateClosedMS,
                        status: this.state.statusMs
                    }
                    // console.log(dataPi);
                    await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/pi/${pi.idOrderPi}/updateStatus`, dataPi, { headers: authHeader() });
                    // console.log(dataMs);
                    await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/updateStatus`, dataMs,{ headers: authHeader() });
                    this.handleSubmitted(event, this.state.orderTarget)
                    this.setState({isEdit: false});
                }
            }
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

    handleSubmitted(event, order) {
        event.preventDefault();
        this.setState({isSubmitted: true, orderTarget: order});
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
    getMs(idOrder){
        let ms = this.state.listMs.filter(ms => ms.idOrder.idOrder === idOrder);

        if (ms.length !== 0) {
            return ms[0];
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

    checkStatus(order){
        if(order.projectInstallation === true && order.managedService === true){
            let pi = this.getPi(order.idOrder)
            let ms = this.getMs(order.idOrder)
            if (pi.status === null && ms.status === null){
                return "Inactive, Inactive";
            } else if (pi.status === null && ms.status !== null) {
                return "Inactive, " + ms.status;
            } else if (pi.status !== null && ms.status === null) {
                return pi.status + ", Inactive";
            } else {
                return pi.status + ", " + ms.status;
            }
        }

        if (order.projectInstallation === true){
            let pi = this.getPi(order.idOrder)
            // console.log(order)
            // console.log(pi)
            if (pi.status === null){
                return "Inactive";
            } else { return pi.status;}

        } else if (order.managedService === true){
            let ms = this.getMs(order.idOrder)
            if (ms.status === null){
                return "Inactive";
            } else { return ms.status;}
        }
    }

    checkStatusPi(order){
        if (order.projectInstallation === true){
            let pi = this.getPi(order.idOrder)
            // console.log(order)
            // console.log(pi)
            if (pi.status === null){
                return "Inactive";
            } else { return pi.status;}

        }
    }

    checkStatusMs(order){
        if (order.managedService === true){
            let ms = this.getMs(order.idOrder)
            if (ms.status === null){
                return "Inactive";
            } else { return ms.status;}
        }
    }

    checkClosedForRender(order, listMaintenance){
        if (order.projectInstallation === true && order.managedService === true){
            let pi = this.getPi(order.idOrder)
            let ms = this.getMs(order.idOrder)
            if (pi.status == "Closed" && ms.status == "Closed"){
                return "Order is Closed"
            } else {
                return(
                    <Button
                        className={classes.button1}
                        onClick={() => this.handleEdit(order, listMaintenance)}>
                        Ubah
                    </Button>
                );
            }
        } else if (order.projectInstallation === true) {
            let pi = this.getPi(order.idOrder)
            if (pi.status == "Closed") {
                return "Order is Closed"
            } else {
                return(
                    <Button
                        className={classes.button1}
                        onClick={() => this.handleEdit(order, listMaintenance)}>
                        Ubah
                    </Button>
                );
            }
        } else if (order.managedService === true) {
            let ms = this.getMs(order.idOrder)
            if (ms.status == "Closed") {
                return "Order is Closed"
            } else {
                return(
                    <Button
                        className={classes.button1}
                        onClick={() => this.handleEdit(order, listMaintenance)}>
                        Ubah
                    </Button>
                );
            }
        }




    }

    handleEdit(order, listMaintenance) {
        this.setState({isEdit: true, orderTarget: order, listMaintenance: listMaintenance});
        const statusMaintenancesUpdated = this.state.statusMaintenances;
        if (order.projectInstallation === true){
            this.setState({statusPi: this.checkStatus(order)});
        }
        else if (order.managedService === true){
            this.setState({statusMs: this.checkStatus(order)});
            let ms = this.getMs(order.idOrder);
            listMaintenance = ms.listMaintenance;
            for(let i=0; i<listMaintenance.length; i++){

                let maintenance = listMaintenance[i];
                if (maintenance.maintained === true){
                    statusMaintenancesUpdated[i] = "Maintained";
                } else {
                    statusMaintenancesUpdated[i] = "Not Maintained";
                }
            }
            // console.log(statusMaintenancesUpdated);
            this.setState({statusMaintenances: statusMaintenancesUpdated})
        }
    }

    // Menyaring list order sesuai dengan data yang dimasukkan pada form search
    handleFilter(event){
        console.log(this.state.ordersVerified)
        let newOrderList = this.state.ordersVerified;
        const { value } = event.target;
        if( value !== "" ){
            newOrderList = this.state.ordersVerified.filter(order => {
                return (order.orderName.toLowerCase().includes(value.toLowerCase()) ||
                    order.noPO.toLowerCase().includes(value.toLowerCase()))
            });
            this.setState({ isFiltered : true });
        }else{
            this.setState({ isFiltered : false });
        }
        this.setState({ orderFiltered : newOrderList });
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
        const statusMaintenancesUpdated = this.state.statusMaintenances;
        if( name.substring(0,17) === "statusMaintenance"){
            let index = Number(name.substring(17));
            statusMaintenancesUpdated[index] = value;
            this.setState({ statusMaintenances: statusMaintenancesUpdated});
        }else{
            this.setState({ [name]: value});
        }
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
            isFiltered,
            orderFiltered
        } = this.state;
        let listMaintenance;
        const tableHeaders = ['No.', 'Nomor PO', 'Perusahaan', 'Tipe', 'Status','Aksi'];
        const tableRows = isFiltered ? orderFiltered.map((order) => [
            order.noPO,
            order.clientName,
            this.checkTypeOrder(order.projectInstallation, order.managedService),
            this.checkStatus(order),
            this.checkClosedForRender(order, listMaintenance)
        ])
        : ordersVerified.map((order) => [
                order.noPO,
                order.clientName,
                this.checkTypeOrder(order.projectInstallation, order.managedService),
                this.checkStatus(order),
                this.checkClosedForRender(order, listMaintenance)
            ])
        ;

        return (
            <div className={classes.container}>
                <h1 className="text-center">Daftar Order</h1>
                <div className="d-flex justify-content-end" style={{padding: 5}}>
                    <div className={classes.search}><Form.Control type="text" size="sm" placeholder="Cari..." onChange={this.handleFilter}/></div>
                </div>
                <CustomizedTables headers={tableHeaders} rows={tableRows}/>
                <Modal show={isEdit} handleCloseModal={this.handleCancel}>
                    <div><h3 id='titleform' >Form Ubah Status Order</h3></div>
                    {orderTarget !== null ?
                        <><Form>
                            <table>
                                <tr>
                                    <td>Id Order</td>
                                    <td>: {orderTarget.idOrder}</td>
                                </tr>
                                <tr>
                                    <td>Nomor PO</td>
                                    <td>: {orderTarget.noPO}</td>
                                </tr>
                                <tr>
                                    <td>Perusahaan</td>
                                    <td>: {orderTarget.clientOrg}</td>
                                </tr>
                                { orderTarget.projectInstallation && this.checkStatusPi(orderTarget) !== "Closed"?
                                    <><tr>
                                        <td style={{fontWeight: 'bold'}}>Project Installation</td>
                                    </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td><Form.Control
                                                as="select"
                                                size="lg"
                                                name="statusPi"
                                                value={ this.state.statusPi }
                                                onChange={this.handleChangeField}>
                                                <option value="Inactive">Inactive</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Closed">Closed</option>
                                            </Form.Control></td>
                                        </tr>
                                        { this.state.isErrorPiClosed ?
                                            <><tr>
                                                <td style={{fontWeight: 'bold', color: "#fd693e"}}>Progress order belum 100%</td>
                                            </tr></> : <></>}
                                    </> : <></>}
                                { orderTarget.managedService && this.checkStatusMs(orderTarget) !== "Closed"?
                                    <><tr>
                                        <td style={{fontWeight: 'bold'}}>Managed Service</td>
                                    </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td><Form.Control
                                                as="select"
                                                size="lg"
                                                name="statusMs"
                                                value={ this.state.statusMs }
                                                onChange={this.handleChangeField}>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Active">Active</option>
                                                <option value="Closed">Closed</option>
                                            </Form.Control></td>
                                        </tr>
                                        { this.state.isErrorMsClosed ?
                                            <><tr>
                                                <td style={{fontWeight: 'bold', color: "#FD693E"}}>Masih ada maintenance yang belum di-maintain</td>
                                            </tr></> : <></>}
                                    </>: <></>}
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
                    {orderTarget !== null ? <>
                        <div>
                            <h3 id='titleform' >
                                Status Order dengan nomor {orderTarget.noPO} berhasil diubah menjadi
                                {orderTarget.projectInstallation ? " " + this.state.statusPi : <></>}
                                {orderTarget.managedService ? " " + this.state.statusMs : <></>}
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

export default ChangeStatusOrder;