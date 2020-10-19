import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Icon } from '@material-ui/core';
import InputBase from '@material-ui/core/InputBase';
import Checkbox from '@material-ui/core/Checkbox';
import { Button } from '@material-ui/core';

import { TableHead } from '@material-ui/core';

import FileRow from './FileRow';
import FileAddRow from './FileAddRow';
import TablePaginationActions from './Shared/TablePaginationActions';
import { fileService } from '../Services/File.service';

export default class FileList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addNew: false,
      addFolder: false,
			editId: null,
      isLoading: true,
			files: [],
			searchQuery: { query:'', global: false, exactMatch: false},
      rowsPerPage: 10,
      page: 0,     
      order: 'asc',
      orderBy: 'lastModifiedDate',
      parent: null,
      grandParentId: null
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    fileService.getAllRoot().then((data) => {
      this.setState({
        isLoading: false,
        files: data
      });
    });
  };

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value, 10) });
  };

	handleCardEdit = (cardId) => {
    this.setState({ editId: cardId });
	};
	
  handleFileDeleted = (file) => {
    let newFiles = [...this.state.files];
    const idx = this.state.files.indexOf(file);
    newFiles.splice(idx, 1);

    this.setState({
        files: newFiles,
        searchQuery: {...this.state.searchQuery, query: '' },
    });
  };

  handleFolderOpen = (folder) => {
    this.setState({
      isLoading: true
    });

    fileService.getForParent(folder.id).then((data) => {
      this.setState({
        isLoading: false,
        files: data,
        grandParentId: this.state.parent?.id,
        parent: folder
      });
    });
  }

  handleFolderUp = () => {
    this.setState({
      isLoading: true
    });

    let promise = fileService.getAllRoot();
    if(this.state.grandParentId){
      promise = fileService.getForParent(this.state.grandParentId)
    }

    return promise.then((data) => {
      this.setState({
        isLoading: false,
        files: data,
        grandParentId: data[0].parent?.parentFolderId,
        parent: data[0].parent        
      });
    });
  }

  handleFileEdit = (fileId) => {
    this.setState({ editId: fileId });
  }

  handleFileCreated = (file) => {
    if (file) {
      const newFiles = [file, ...this.state.files];

      this.setState({
        addNew: false,
        files: newFiles
      });
    } else {
      this.setState({ addNew: false });
    }
  }

  handleFileSaved = (savedFile) => {
    if (savedFile) {
      const newFiles = [...this.state.files];
      const existing = newFiles.find((f) => f.id === savedFile.id);
      const fileIdx = newFiles.indexOf(existing);

      newFiles[fileIdx] = savedFile; // otherwise files not updated
      this.setState({
        files: newFiles,
				searchQuery: {...this.state.searchQuery, query: '' },
				editId: null,
      });
    } else {
      this.setState({ editId: null });
    }
  };

  checkExisting = (editedFile, willUnmountCallback) => {
    const sameNameFile = this.state.files.find(
      (f) => f.name === editedFile.name 
              && f.id !== editedFile.id 
              // eslint-disable-next-line
              && f.parentFolderId == editedFile.parentFolderId // on purpose
              && f.isFolder == editedFile.isFolder
    );

    if (sameNameFile) {
      return {
        title: 'Same name!',
        message:
          'File with same name (' +
          editedFile.name +
          ') already exists. File not saved!',
        buttons: [
          {
            label: 'OK',
          },
        ],
        willUnmount: () => {
          if (willUnmountCallback) {
            willUnmountCallback();
          }
        },
      };
    }

    return null;
  };

  descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => this.descendingComparator(a, b, orderBy)
      : (a, b) => -this.descendingComparator(a, b, orderBy);
  };

  stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  handleSort = (property) => {
    const isAsc = this.state.orderBy === property && this.state.order === 'asc';
    this.setState({ order: isAsc ? 'desc' : 'asc' });
    this.setState({ orderBy: property });
  };

  handleSearch = () => {
    let searchModel = this.state.searchQuery;
    searchModel.parentId = this.state.parent?.id;

    fileService.search(searchModel).then((data) => {
      this.setState({
        isLoading: false,
        files: data,
        searchQuery: searchModel,
        parent: searchModel.global ? null : this.state.parent,
        grandParentId: searchModel.global ? null : this.state.grandParentId
      });
    });
  }

  handleClearSearch = () => {
    const searchModel = { 
      query:'', 
      global: false, 
      exactMatch: false, 
      parentId: null};    

    fileService.search(searchModel).then((data) => {
      this.setState({
        isLoading: false,
        files: data,
        searchQuery: searchModel
      });
    });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <p
          style={{
            marginTop: '50',
            padding: 25,
            backgroundColor: 'whitesmoke',
            textAlign: 'center',
          }}>
          Loading...
        </p>
      );
    }

    const headCells = [
      { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
      { id: 'lastModifiedDate', numeric: false, disablePadding: false, label: 'Last Modified Date' },      
    ];

    const {
      rowsPerPage,
      searchQuery,
			page,
			files,
      order,
			orderBy,
      editId,
      parent
    } = this.state;

    return (
        <Paper elevation={10}>
          <TableContainer className="filesTable">
            <Table style={{ minWidth: 500, maxWidth: '100vw' }}>
              <TableBody>
                {this.state.addNew ? (
                  <FileAddRow        
                    parentId={this.state.parent?.id}  
                    isFolder={this.state.addFolder}
                    onFileCreated={this.handleFileCreated}     
                    validateSave={this.checkExisting}
                    cancel={() => this.setState({ addNew: false })}
                  />
                ) : (
                  <TableRow>
                    <TableCell
                      className="addActionCell"
                      title="Add new file"
                      align="center"
                      colSpan={8}
                      onClick={() => this.setState({ addNew: true, addFolder: false })}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icon>add_circle_outline</Icon>
                        <span className="addText">New file</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="addActionCell"
                      title="Add new folder"
                      align="center"
                      colSpan={8}
                      onClick={() => this.setState({ addNew: true, addFolder: true })}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icon>add_circle_outline</Icon>
                        <span className="addText">New folder</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="searchDiv">
              <InputBase
                className="search"
                style={{ padding: 5 }}
                placeholder="Search…"
                type="text"
                value={searchQuery.query}
                onChange={(event) => this.setState({searchQuery: {...this.state.searchQuery, query: event.target.value}})}
                inputProps={{ 'aria-label': 'search' }}
              />
              
                <Checkbox
                  style={{ maxWidth: 100 }}
                  checked={searchQuery.exactMatch}
                  onChange={(event) => this.setState({searchQuery: {...this.state.searchQuery, exactMatch: event.target.checked}})}
                  color="primary"
                />
                <label>
                  Exact
                </label>
              
                <Checkbox
                  style={{ maxWidth: 100 }}
                  checked={searchQuery.global}
                  onChange={(event) => this.setState({searchQuery: {...this.state.searchQuery, global: event.target.checked}})}
                  color="primary"
                />
                <label>
                  Global
                </label>
              <Button
                style={{ display: 'inline-block', marginLeft: 10 }}
                variant="contained"
                color="primary"
                onClick={this.handleSearch}>
                Search
              </Button>
              <Button
                style={{ display: 'inline-block', marginLeft: 10 }}
                variant="contained"
                color="default"
                onClick={this.handleClearSearch}>
                Clear
              </Button>
            </div>
            <Table stickyHeader style={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    {parent && 
                    <>
                      {parent.name}
                      <span style={{minWidth: '10vw', marginRight: 7, marginLeft: 17}}>|</span>
                      <span className="fileActionCell">                      
                        <Icon style={{top: 6, position: 'relative', fontSize: 26, fontWeight: 'bold'}} onClick={this.handleFolderUp}>arrow_upward</Icon>
                      </span>
                      <span style={{minWidth: '10vw', margin: 7}}>|</span>
                    </>}
                  </TableCell>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : 'left'}
                      padding={headCell.disablePadding ? 'none' : 'default'}
                      sortDirection={orderBy === headCell.id ? order : false}>
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={(e) => this.handleSort(headCell.id)}>
                        {headCell.label}
                        {orderBy === headCell.id ? (
                          <span style={visuallyHiddenStyle}>
                            {order === 'desc'
                              ? 'sorted descending'
                              : 'sorted ascending'}
                          </span>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(rowsPerPage > 0
                  ? this.stableSort(
											files,
                      this.getComparator(order, orderBy)
                    ).slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : this.stableSort(
                      files,
                      this.getComparator(order, orderBy)
                    )
                ).map((file) => (
                  <FileRow
                    parentId={parent?.id}
                    key={file.id}
										file={file}
										isEdit={file.id === editId}
                    onFileEditing={this.handleFileEdit}
                    onFileSaved={this.handleFileSaved}
                    onFileDeleted={this.handleFileDeleted}
                    onFolderOpen={this.handleFolderOpen}
                    validateSave={this.checkExisting}
                    zoomFile={this.zoom}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[
                      3,
                      5,
                      10,
                      25,
                      { label: 'All', value: -1 },
                    ]}
                    colSpan={8}
                    count={files.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: { 'aria-label': 'rows per page' },
                      native: true,
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>        
    );
  }
}

const visuallyHiddenStyle = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1,
};
