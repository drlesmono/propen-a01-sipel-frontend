import React, { Component } from 'react'
import InstallationProjectService from "../../services/InstallationProjectService";
import classes from "./styles.module.css";
import Modal from "react-bootstrap/Modal";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "react-bootstrap";


class ListTaskComponent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            id: this.props.match.params.id,
            listTask: [],
            orderName: "",
            isDeleted: false

        }
        this.addTask = this.addTask.bind(this);
        this.editTask = this.editTask.bind(this);
        this.editProgres = this.editProgres.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        
    }

    deleteTask(idTask){
        InstallationProjectService.deleteTask(idTask).then( res => {
            this.setState({listTask: this.state.listTask.filter(task => task.idTask !== idTask), isDeleted: true})
        });
    }

    editTask(id, idTask){
        this.props.history.push(`/update-task/${id}/${idTask}`);
    }

    editProgres(id, idTask){
        this.props.history.push(`/add-progress/${id}/${idTask}`);
    }


    componentDidMount(){

        InstallationProjectService.getListTaskByIdPi(this.state.id).then((res) => {
            this.setState({listTask: res.data});
        });
        InstallationProjectService.getPiNameByIdPi(this.state.id).then((res1) => {
            this.setState({orderName: res1.data});
        });
        
    }

    cancel(){
        this.setState({ isDeleted: false});
    }


    addTask(idPi){
        this.props.history.push(`/add-task/${idPi}`);
    }

    render() {
        const { isDeleted } = this.state;
        return (
            <div className={classes.container}>
            <div>
                {/* Menampilkan modal berisi notifikasi ketika berhasil menghapus data */}
                <Modal
                    show={isDeleted}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                     <Modal.Header closeButton onClick={this.cancel.bind(this)}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Notification
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="d-flex justify-content-center">Task Berhasil Dihapus.</div><br></br>
                        <div className="d-flex justify-content-center">
                            <Button variant="primary" className={classes.button1} onClick={this.cancel.bind(this)}>
                                Kembali
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
                <h2 className="text-center">{"Daftar Task Order " + this.state.orderName }</h2>
                <br></br>
                <br></br>
                <div className="row">
                    <button onClick = { () => this.addTask(this.state.id) } className="btn btn-primary">+ Tambah Task</button>
                </div>
                <div className = "row">
                    <table className = "table table-striped table-bordered">

                        <thead>
                            <tr>
                                <th>Nama Task</th>
                                <th>Deskripsi Task</th>
                                <th>Progres Task</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                this.state.listTask.map(
                                    task =>
                                    <tr key = {task.idTask}>
                                        <td>{task.taskName}</td>
                                        <td>{task.description}</td>
                                        <td>{task.percentage + "%"}</td>
                                        <td>
                                            <button onClick = { () => this.editTask(this.state.id, task.idTask)} className="btn btn-info">Ubah Task</button>
                                            <button onClick = { () => this.editProgres(this.state.id, task.idTask)} className="btn btn-warning" style={{marginLeft: "10px"}}>Ubah Progres</button>
                                            <button onClick = { () => this.deleteTask(task.idTask)} className="btn btn-danger" style={{marginLeft: "10px"}}>Hapus Task</button>
                                        </td>

                                    </tr>

                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        )
    }
}

export default ListTaskComponent