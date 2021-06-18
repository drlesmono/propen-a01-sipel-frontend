import React, { Component } from 'react'
import InstallationProjectService from "../../services/InstallationProjectService";
import Modal from "react-bootstrap/Modal";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "react-bootstrap";
import classes from "./styles.module.css";

class UpdateTaskProgressComponent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            idPi: this.props.match.params.idPi,
            idTask: this.props.match.params.idTask,
            percentage: '',
            isSuccess: false

        }
        this.changePercentageHandler = this.changePercentageHandler.bind(this);
        
    }

    componentDidMount(){
        InstallationProjectService.getTaskByIdTask(this.state.idTask).then( (res) =>{
            let task = res.data;
            this.setState({percentage: task.percentage});
        });
    }
    
    changePercentageHandler= (event) => {
        this.setState({percentage: event.target.value});
    }
    
    updateTaskProgress = (e) => {
        e.preventDefault();
        let task = {percentage: this.state.percentage};
        console.log('task => ' + JSON.stringify(task));
        
        InstallationProjectService.updateTaskModel(task, this.state.idTask).then( this.setState({isSuccess: true}) );
        // .then( res => {
        //     this.props.history.push(`/list-task/${this.state.idPi}`)
        // });
        // alert("Progres Task Berhasil Diubah");
    }

    cancel(){
        this.props.history.push(`/list-task/${this.state.idPi}`); 
    }

    render() {
        const { isSuccess } = this.state;

        return (
            <div>
                {/* Menampilkan modal berisi notifikasi ketika berhasil menyimpan data */}
                <Modal
                    show={isSuccess}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                     <Modal.Header closeButton onClick={this.cancel.bind(this)}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Notification
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="d-flex justify-content-center">Progres Task Berhasil Diubah.</div><br></br>
                        <div className="d-flex justify-content-center">
                            <Button variant="primary" className={classes.button1} onClick={this.cancel.bind(this)}>
                                Kembali
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
                <br/><br/>
                <div className="container">
                    <div className="row">
                        <div className = "card col-md-6 offset-md-3 offset-md-3">
                            <br/>
                            <h3 className="text-center">Ubah Progres Task</h3>
                            <div className = "card-body">
                                                                
                                <form>

                                    <div className="form-group">
                                        <label>Progres Task</label>
                                        <input placeholder="Progres Task" name="percentage" className="form-control" 
                                            value={this.state.percentage} onChange={this.changePercentageHandler}/>
                                    </div>

                                    <button className="btn btn-success" onClick={this.updateTaskProgress}>Simpan</button>
                                    <button className="btn btn-danger" onClick={this.cancel.bind(this)} style={{marginLeft: "10px"}}>Batal</button>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default UpdateTaskProgressComponent