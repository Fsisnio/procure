import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Settings as SettingsIcon,
  Lock,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import ChangePasswordDialog from './ChangePasswordDialog';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  department: string;
  location: string;
  avatar: string;
  joinDate: Date;
  lastLogin: Date;
}

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  language: string;
  theme: string;
  timezone: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
          email: 'john.doe@procurex.com',
    phone: '+1 (555) 123-4567',
            company: 'ProcureX Corporation',
    position: 'Supply Chain Manager',
    department: 'Procurement',
    location: 'New York, NY',
    avatar: 'JD',
    joinDate: new Date('2023-01-15'),
    lastLogin: new Date('2024-01-25'),
  });

  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    language: 'English',
    theme: 'Light',
    timezone: 'UTC-5',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserProfile>({
    defaultValues: profile,
  });

  const handleSaveProfile = (data: UserProfile) => {
    setProfile({ ...data, avatar: `${data.firstName.charAt(0)}${data.firstName.charAt(0)}` });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePasswordChange = (newPassword: string) => {
    // Ici, vous devriez appeler une API pour changer le mot de passe
    // Pour l'instant, on simule le changement
    console.log('Password changed to:', newPassword);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancelEdit = () => {
    reset(profile);
    setIsEditing(false);
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setShowSettings(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const stats = [
    { label: 'Suppliers Managed', value: '24', color: '#1976d2' },
    { label: 'Orders This Month', value: '156', color: '#2e7d32' },
    { label: 'Total Spending', value: '$45,230', color: '#ed6c02' },
    { label: 'Active Projects', value: '8', color: '#9c27b0' },
  ];

  const recentActivities = [
    { action: 'Added new supplier', time: '2 hours ago', type: 'supplier' },
    { action: 'Updated order status', time: '4 hours ago', type: 'order' },
    { action: 'Generated monthly report', time: '1 day ago', type: 'report' },
    { action: 'Contacted supplier', time: '2 days ago', type: 'contact' },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      {/* Sticky Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#f5f5f5',
        pb: 2,
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Profile
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Lock />}
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
          <Button
            variant={isEditing ? 'outlined' : 'contained'}
            startIcon={isEditing ? <Cancel /> : <Edit />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} direction={isMobile ? 'column' : 'row'}>
        {/* Colonne gauche : Avatar, infos, stats, activité */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 90, height: 90, fontSize: '2.5rem', bgcolor: '#1976d2', mb: 2 }}
              >
                {profile.avatar}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                {profile.position} • {profile.department}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Member since {profile.joinDate.toLocaleDateString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
              Your Statistics
            </Typography>
            <Grid container spacing={2}>
              {stats.map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.time}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Colonne droite : Formulaire profil */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: { xs: 2, md: 4 }, boxShadow: 3 }}>
            <CardContent>
              <form onSubmit={handleSubmit(handleSaveProfile)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{ required: 'First name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="First Name"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{ required: 'Last name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Last Name"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="email"
                      control={control}
                      rules={{ 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email"
                          type="email"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{ required: 'Phone is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Phone"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="company"
                      control={control}
                      rules={{ required: 'Company is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.company}
                          helperText={errors.company?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="position"
                      control={control}
                      rules={{ required: 'Position is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Position"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.position}
                          helperText={errors.position?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="department"
                      control={control}
                      rules={{ required: 'Department is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Department"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.department}
                          helperText={errors.department?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="location"
                      control={control}
                      rules={{ required: 'Location is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Location"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.location}
                          helperText={errors.location?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" startIcon={<Save />}>
                      Save Changes
                    </Button>
                    <Button variant="outlined" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </Box>
                )}
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Settings
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                />
              }
              label="Push Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.weeklyReports}
                  onChange={(e) => setSettings({ ...settings, weeklyReports: e.target.checked })}
                />
              }
              label="Weekly Reports"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
              Preferences
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    label="Language"
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="German">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    label="Theme"
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
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
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button onClick={() => handleSaveSettings(settings)} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onPasswordChange={handlePasswordChange}
      />
    </Box>
  );
};

export default Profile; 