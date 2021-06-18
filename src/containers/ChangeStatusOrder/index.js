import React, { Component } from "react";
import APIConfig from "../../APIConfig";
import CustomizedTables from "../../components/Table";
import CustomizedButtons from "../../components/Button";
import Modal from "../../components/Modal";
import { Form } from "react-bootstrap";
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
        this.handleSubmitted = this.handleSubmitted.bind(this)
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

        } catch (error) {
            alert("Oops terjadi masalah pada server");
            console.log(error);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log(this.state.orderTarget);
        try {
            if(this.state.orderTarget.projectInstallation === true){
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
                        console.log(dataPi);
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
                    console.log(dataPi);
                    await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/pi/${pi.idOrderPi}/updateStatus`, dataPi, { headers: authHeader() });
                    this.handleSubmitted(event, this.state.orderTarget)
                    this.setState({isEdit: false});
                }
            }
            if(this.state.orderTarget.managedService === true){
                const ms = this.getMs(this.state.orderTarget.idOrder);
                if (this.state.statusMs === "Closed"){
                    let listMaintenance = ms.listMaintenance;
                    for(let i=0; i<listMaintenance.length; i++){
                        let maintenance = listMaintenance[i];
                        let booleanStatus = false;
                        if (this.state.statusMaintenances[i] === "Maintained"){
                            booleanStatus = true;
                        }
                        const dataMaintenance = {
                            idMaintenance: maintenance.idMaintenance,
                            dateMn: maintenance.dateMn,
                            maintained: booleanStatus
                        }
                        await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/maintenance/${maintenance.idMaintenance}/updateStatus`, dataMaintenance, { headers: authHeader() });
                    }
                    console.log(ms.listMaintenance);
                    const msUpdated = await APIConfig.get(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}`, { headers: authHeader() });
                    console.log(msUpdated.data.listMaintenance);
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
                    let listMaintenance = ms.listMaintenance;
                    for(let i=0; i<listMaintenance.length; i++){
                        let maintenance = listMaintenance[i];
                        let booleanStatus = false;
                        if (this.state.statusMaintenances[i] === "Maintained"){
                            booleanStatus = true;
                        }
                        const dataMaintenance = {
                            idMaintenance: maintenance.idMaintenance,
                            dateMn: maintenance.dateMn,
                            maintained: booleanStatus
                        }
                        await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/maintenance/${maintenance.idMaintenance}/updateStatus`, dataMaintenance, { headers: authHeader() } );
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
                    // console.log(dataMs);
                    await APIConfig.put(`/order/${this.state.orderTarget.idOrder}/ms/${ms.idOrderMs}/updateStatus`, { headers: authHeader() });
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
        if (order.projectInstallation === true){
            let pi = this.getPi(order.idOrder)
	  console.log(order)
	  console.log(pi)
	    if (pi.status === null){
		return "Inactive";	
	    } else { return pi.status;}
            
        }
        else if (order.managedService === true){
            let ms = this.getMs(order.idOrder)
            if (ms.status === null){
		return "Inactive";	
	    } else { return ms.status;}
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
            console.log(statusMaintenancesUpdated);
            this.setState({statusMaintenances: statusMaintenancesUpdated})
        }
    }

    // Menyaring list order sesuai dengan data yang dimasukkan pada form search
    handleFilter(event){
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
        console.log(name, value);
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
        } = this.state;
        let listMaintenance;
        const tableHeaders = ['No.', 'Id Order', 'Nomor PO', 'Perusahaan', 'Tipe', 'Status','Aksi'];
        const tableRows = ordersVerified.map((order) => [
            order.idOrder,
            order.noPO,
            order.clientName,
            this.checkTypeOrder(order.projectInstallation, order.managedService),
            this.checkStatus(order),
            <CustomizedButtons
                variant="contained"
                size="small"
                color="#FD693E"
                onClick={() => this.handleEdit(order, listMaintenance)}>
                Ubah
            </CustomizedButtons>
        ]);
        const tableMaintenanceHeaders = ['No.', 'Tanggal Maintenance', 'Status'];
        let tableMaintenanceRows;


        if(orderTarget !== null){
            if(orderTarget.projectInstallation === true){
            }
            if(orderTarget.managedService === true){
		let ms = this.getMs(orderTarget.idOrder);
                tableMaintenanceRows = ms.listMaintenance.map((maintenance, index) => [
                    maintenance.dateMn,
                    <Form.Control
                        as="select"
                        size="lg"
                        key={index}
                        name={"statusMaintenance" + index}
                        value={ statusMaintenances[index] }
                        onChange={this.handleChangeField}>
                        <option value="Not Maintained">Not Maintained</option>
                        <option value="Maintained">Maintained</option>
                    </Form.Control>
                ]);
                listMaintenance = ms.listMaintenance.map((maintenance) => maintenance.idMaintenance);
            }
        }

        return (
            <div>
                <h1>Daftar Order</h1>
                <div className={classes.search}><Form.Control type="text" size="sm" placeholder="Cari..." onChange={this.handleFilter}/></div>
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
                                { orderTarget.projectInstallation ?
                                    <><tr>
                                        <td style={{fontWeight: 'bold'}}>Project Installation</td>
                                    </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td><Form.Control
                                                as="select"
                                                size="lg"
                                                name="statusPi"
                                                value={ this.checkStatus(orderTarget) }
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
                                { orderTarget.managedService ?
                                    <><tr>
                                        <td style={{fontWeight: 'bold'}}>Managed Service</td>
                                    </tr>
                                        <tr>
                                            <td>Maintenances</td>
                                            <td>
                                                <><CustomizedTables
                                                    headers={tableMaintenanceHeaders}
                                                    rows={tableMaintenanceRows}>
                                                </CustomizedTables></>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td><Form.Control
                                                as="select"
                                                size="lg"
                                                name="statusMs"
                                                value={ this.checkStatus(orderTarget) }
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
                                <CustomizedButtons variant="contained" size="medium" color="#FD693E" onClick={this.handleSubmit}>
                                    Simpan
                                </CustomizedButtons>
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
                        <CustomizedButtons variant="contained" size="medium" color="#FD693E" onClick={this.handleCancel}>
                            Ok
                        </CustomizedButtons>
                    </div>
                </Modal>
            </div>
        )
    }


}

export default ChangeStatusOrder;