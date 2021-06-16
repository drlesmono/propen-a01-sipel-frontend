import React, { Component } from 'react'
import InstallationProjectService from "../../services/InstallationProjectService";
import classes from "./styles.module.css";



class ListVerifiedPiOrder extends Component {
    constructor(props) {
        super(props)

        this.state = {
            piOrders: []

        }
        this.retrieveListTask = this.retrieveListTask.bind(this);
        this.getDate = this.getDate.bind(this);
    }

    retrieveListTask(id){
        this.props.history.push(`/list-task/${id}`); 

    }

    getDate(date) {
        let oldDate = new Date(date);
        const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return oldDate.getDate() + " " + month[oldDate.getMonth()] + " " + oldDate.getFullYear();

    }

    componentDidMount(){

        InstallationProjectService.getVerifiedOrderPi().then((res) => {
            this.setState({ piOrders: res.data});
        });
        
    }

    render() {
        
        return (
            <div className={classes.container}>
            <div>
            <div>
                <h2 className="text-center">Daftar Proyek Instalasi</h2>
                <br></br>
                <br></br>
                <div className = "row">
                    <table className = "table table-striped table-bordered">

                        <thead>
                            <tr>
                                <th>Nama Order</th>
                                <th>Target Selesai</th>
                                <th>Progres</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                this.state.piOrders.map(
                                    piOrder =>
                                    <tr key = {piOrder.idOrderPi}>
                                        <td>{piOrder.orderName}</td>
                                        <td>{this.getDate(piOrder.deadline)}</td>
                                        <td>{piOrder.percentage + "%"}</td>
                                        <td>
                                            <button onClick = { () => this.retrieveListTask(piOrder.idOrderPi) } className="btn btn-info">Lihat Task</button>
                                        </td>

                                    </tr>

                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
       )

    }
}

export default ListVerifiedPiOrder