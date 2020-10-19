import React from 'react';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { Icon } from '@material-ui/core';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import SimpleReactValidator from 'simple-react-validator';

import { fileService } from '../Services/File.service';

export default class FileRow extends React.Component {
  constructor(props) {
    super(props);

    this.validator = new SimpleReactValidator({ autoForceUpdate: this });

    this.state = {
      editedFile: {
        ...this.props.file
      },
      saving: false,
      folderOpen: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.isEdit !== prevProps.isEdit) {
      // because of multiple edits so that last edit state is not preserved
      // update editedFile with original file values
      this.setState({
        editedFile: {
          ...this.props.file,
        },
      });
    }
  }

  handleFileNameChange = (e) => {
    this.setState({
      editedFile: { ...this.state.editedFile, name: e.target.value },
    });
  };

  openFolder = (folder) => {
      this.props.onFolderOpen(folder);
  }

  deleteFile = (file) => {
    confirmAlert({
      title: 'Confirm deletion',
      message: 'Delete file "' + file.name + '"?',
      buttons: [
        {
          label: 'Yes',
          onClick: () =>
            fileService.deleteFile(file.id).then(() => {
              confirmAlert({
                title: 'Deleted!',
                buttons: [
                  {
                    label: 'OK',
                  },
                ],
              });

              this.props.onFileDeleted(file);
            }),
        },
        {
          label: 'No',
        },
      ],
    });
  };

  cancel = (file) => {
    confirmAlert({
      title: 'Cancel editing',
      message:
        'Cancel editing file "' + file.name + '"? Changes will not be saved.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.props.onFileEditing(null),
        },
        {
          label: 'No',
        },
      ],
    });
  };

  save = (file) => {
    if (this.validator.allValid()) {
      this.setState({ saving: true });
      this.saveFile(file);
    } else {
      this.validator.showMessages();
    }
  };

  saveFile = (editedFile) => {   
    const validationErr = this.props.validateSave(editedFile);

    if (!validationErr) {
      confirmAlert({
        title: 'Save changes',
        message: 'Save changes made on file?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => this.makeSave(editedFile),
          },
          {
            label: 'No',
            onClick: () => this.setState({ saving: false })
          },
        ],
        closeOnEscape: false,
        closeOnClickOutside: false,
      });
    } else {
      this.setState({ saving: false })

      confirmAlert(validationErr);
    }
  };

  makeSave = (editedFile) => {
    const result = fileService
      .edit(editedFile)
      .catch((err) => {
        console.log(err);

        confirmAlert({
          title: 'Error!',
          message: 'File "' + editedFile.name + '" was NOT saved.' + err,
          buttons: [
            {
              label: 'OK',
            },
          ],
          closeOnEscape: true,
          closeOnClickOutside: true,
        });

        return false;
      })
      .finally(() => this.setState({ saving: false }));

    if (!result) {
      this.props.onFileEditing(null);
    }
  };

  render() {
    const { file, isEdit, onFileEditing } = this.props;

    const { editedFile } = this.state;

    if (isEdit) {
      return (
        <TableRow>         
          <TableCell component="th" scope="row">
          {file.isFolder && (            
              <Icon onClick={() => this.openFolder(file)}>folder</Icon>
          )}
        </TableCell>  
          <TableCell align="left" className="fileNameCell">
            <textarea
              required
              cols="15"
              rows="7"
              name="name"
              value={editedFile.name}
              onChange={this.handleFileNameChange}
              onBlur={() => this.validator.showMessageFor('Name')}
            />
            <span className="validation-msg">
              {this.validator.message('Name', editedFile.name, 'required')}
            </span>
          </TableCell>        
          <TableCell></TableCell>
          <TableCell align="left" className="fileActionCell">
            {this.state.saving ? (
              <img
                src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
                alt="uploading"
              />
            ) : (
                <>
                  <Icon onClick={() => this.save(editedFile)}>save</Icon>
                  <br />
                  <br />
                  <Icon onClick={() => this.cancel(editedFile)}>cancel</Icon>
                </>
              )}
          </TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow>
        <TableCell component="th" scope="row">
          {file.isFolder && (
            <div className="fileActionCell">
              <Icon onClick={() => this.openFolder(file)}>folder</Icon>
            </div>
          )}
        </TableCell>        
        <TableCell align="left" className="fileNameCell">
          {file.name}
          {file.parentFolderId != this.props.parentId &&
            <small style={{color: 'gray', marginLeft: 6}}>({file.parent?.name})</small>
          }
        </TableCell>
        <TableCell align="left">
            {new Date(file.lastModifiedDate).toLocaleDateString()}
            </TableCell>        
        <TableCell title="edit" align="left" className="fileActionCell">
          <Icon onClick={() => onFileEditing(file.id)}>edit</Icon>
        </TableCell>
        <TableCell title="delete" align="left" className="fileActionCell">
          <Icon onClick={() => this.deleteFile(file)}>delete</Icon>
        </TableCell>
      </TableRow>
    );
  }
}
