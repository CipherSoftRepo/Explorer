import React from 'react';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { Icon } from '@material-ui/core';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import SimpleReactValidator from 'simple-react-validator';
import { fileService } from '../Services/File.service';

export default class FileAddRow extends React.Component {
  constructor(props) {
    super(props);

    this.validator = new SimpleReactValidator({ autoForceUpdate: this });

    this.state = {
      newFile: { isFolder: this.props.isFolder, name: '', parentFolderId: this.props.parentId},
      creating: false
    };
  }


  handleFileNameChange = (e) => {
    this.setState({
      newFile: { ...this.state.newFile, name: e.target.value },
    });
  };

  handleFileIsFolderChange = (e) =>{
    this.setState({
      newFile: { ...this.state.newFile, isFolder: e.target.checked },
    });
  }

  create = (file) => {
    if (this.validator.allValid()) {
    	this.setState({ creating: true });
      this.createFile(file);
    } else {
      this.validator.showMessages();
    }
  };

  createFile = (file) => {
    const validationErr = this.props.validateSave(file);

    if (file && !validationErr) {      
      fileService
        .create(file)
        .then((data) => this.props.onFileCreated(data))
        .catch((err) => {
          console.log(err);

          confirmAlert({
            title: 'Error',
            message: 'Error creating file! Please refresh and try again. (' + err + ')',
            buttons: [
              {
                label: 'OK',
              },
            ],
          });
        });
    } else {
      this.setState({ creating: false });
      confirmAlert(validationErr);
    }
  };

  cancel = () => {
    this.setState({ newFile: { } });

    this.props.cancel();
  };

  render() {
    return (      
      <TableRow style={{backgroundColor: "lime"}} color="primary">   
         <TableCell align="left" >
           <span style={{fontSize: 35}}>
             New
           {this.state.newFile.isFolder ? ( 
              <>&nbsp;Folder</>
            ): (
              <>&nbsp;File</>
            )
          }
        </span>
          </TableCell>   
        <TableCell align="left" className="fileNameCell">
          <label style={{padding: 10}}>Name</label>
          <input
            required
            name="name"
            value={this.state.newFile.name}
            onChange={this.handleFileNameChange}
            onBlur={() => this.validator.showMessageFor('Name')}
          />
          <span className="validation-msg">
            {this.validator.message(
              'Name',
              this.state.newFile.name,
              'required'
            )}
          </span>
        </TableCell>     
        <TableCell align="left" className="fileActionCell">
          {this.state.creating ? (
            <img
              src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
              alt="creating"
            />
          ) : (
              <>
                <Icon style={{marginRight: 30}} title="Create" onClick={() => this.create(this.state.newFile)}>
                  note_add
                </Icon>
                <Icon style={{marginLeft: 30}} title="Cancel" onClick={() => this.cancel()}>
                  cancel
                </Icon>
              </>
            )}
        </TableCell>
      </TableRow>
    );
  }
}
