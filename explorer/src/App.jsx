import React from 'react';

import './App.scss';

import AppBar from '@material-ui/core/AppBar';
import blue from '@material-ui/core/colors/blue';
import Toolbar from '@material-ui/core/es/Toolbar/Toolbar';
import Typography from '@material-ui/core/es/Typography/Typography';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';

import { Switch, NavLink, Route, Redirect } from 'react-router-dom';

import FileList from './Components/FileList';

export default class App extends React.Component {

  theme = createMuiTheme({
    palette: {
      primary: {
        ...blue,
      },
    },

    typography: {
      fontFamily: 'Open Sans',
      // fontSize: '5rem',
    },
  });

  styles = {
    pageStyle: {
      margin: 25,
      padding: 25,
    },
    typography: {
      marginBottom: 20,
    },
    activeLink: {
      textDecoration: 'none',
      color: 'white',
    },
    inactiveLink: {
      textDecoration: 'none',
      color: 'black',
    },
  };

  render() {
    return (
      <MuiThemeProvider theme={this.theme}>        
        <AppBar position="sticky">
          <Toolbar className="toolbarNav">
            <Typography
              variant="h4"
              color="inherit"
              style={{ marginLeft: 10 }}>
              <NavLink
                to="/Dashboard"
                style={this.styles.inactiveLink}
                activeStyle={this.styles.activeLink}>
                Dashboard
              </NavLink>
            </Typography>

            <Typography
              variant="h4"
              color="inherit"
              style={{ marginLeft: 'auto', marginRight: 10 }}>
              <NavLink
                to="Files"
                style={this.styles.inactiveLink}
                activeStyle={this.styles.activeLink}>
                Files
              </NavLink>
            </Typography>             
          </Toolbar>
        </AppBar>

        <Switch>
          <Route exact path="/Files">
            <FileList />
          </Route>

          <Route exact path="/Dashboard">
            <h1
              style={{
                marginTop: '40vh',
                backgroundColor: 'whitesmoke',
                textAlign: 'center',
              }}>
              Welcome to Explorer
            </h1>
          </Route>        

          <Route path="/">
            <Redirect to="/Dashboard" />
          </Route>
        </Switch>
      </MuiThemeProvider>
    );
  }
}
