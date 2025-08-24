import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications,
  Security,
  Language,
  Save,
  Refresh,
  Email,
  Phone,
  Business,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    language: 'English',
    theme: 'Light',
    timezone: 'UTC-5',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    monthlyReports: false,
    lowStockAlerts: true,
    orderNotifications: true,
    supplierUpdates: true,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save settings to backend
    console.log('Saving settings:', settings);
    setShowSuccess(true);
  };

  const handleResetSettings = () => {
    setSettings({
      language: 'English',
      theme: 'Light',
      timezone: 'UTC-5',
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      monthlyReports: false,
      lowStockAlerts: true,
      orderNotifications: true,
      supplierUpdates: true,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetSettings}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                <Language sx={{ mr: 1, verticalAlign: 'middle' }} />
                General Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={settings.theme}
                      label="Theme"
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <MenuItem value="Light">Light</MenuItem>
                      <MenuItem value="Dark">Dark</MenuItem>
                      <MenuItem value="Auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      label="Timezone"
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                      <MenuItem value="UTC-5">Eastern Time (UTC-5)</MenuItem>
                      <MenuItem value="UTC-6">Central Time (UTC-6)</MenuItem>
                      <MenuItem value="UTC-7">Mountain Time (UTC-7)</MenuItem>
                      <MenuItem value="UTC-8">Pacific Time (UTC-8)</MenuItem>
                      <MenuItem value="UTC+0">UTC</MenuItem>
                      <MenuItem value="UTC+1">Central European Time (UTC+1)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                Notification Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label=""
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Push Notifications"
                    secondary="Receive push notifications in browser"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                    }
                    label=""
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Business color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Weekly Reports"
                    secondary="Receive weekly summary reports"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.weeklyReports}
                        onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                      />
                    }
                    label=""
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Business color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Monthly Reports"
                    secondary="Receive monthly summary reports"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monthlyReports}
                        onChange={(e) => handleSettingChange('monthlyReports', e.target.checked)}
                      />
                    }
                    label=""
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Alerts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Business Alerts
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.lowStockAlerts}
                        onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
                      />
                    }
                    label="Low Stock Alerts"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Get notified when products are running low
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.orderNotifications}
                        onChange={(e) => handleSettingChange('orderNotifications', e.target.checked)}
                      />
                    }
                    label="Order Notifications"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Receive updates on order status changes
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.supplierUpdates}
                        onChange={(e) => handleSettingChange('supplierUpdates', e.target.checked)}
                      />
                    }
                    label="Supplier Updates"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Get notified about supplier information changes
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                System Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Application Version
                  </Typography>
                  <Typography variant="body1">
                    v1.0.0
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Database Status
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Connected
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    System Status
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Operational
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 