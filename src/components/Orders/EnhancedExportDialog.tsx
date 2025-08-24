import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Description,
  Visibility,
  Download,
  Settings,
} from '@mui/icons-material';

interface EnhancedExportDialogProps {
  open: boolean;
  onClose: () => void;
  orderData: {
    orderNumber: string;
    orderDate: string;
    expectedDeliveryDate: string;
    supplier: any;
    items: any[];
    notes: string;
    total: number;
    tvaRate: number;
  };
  onExport: (format: string, options: any) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`export-tabpanel-${index}`}
      aria-labelledby={`export-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedExportDialog: React.FC<EnhancedExportDialogProps> = ({
  open,
  onClose,
  orderData,
  onExport,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [template, setTemplate] = useState('professional');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includeTerms, setIncludeTerms] = useState(true);
  const [customHeader, setCustomHeader] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  const [colorScheme, setColorScheme] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');
  const [previewMode, setPreviewMode] = useState(false);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Professionnel', icon: <PictureAsPdf />, description: 'Format standard pour impression et archivage' },
    { value: 'excel', label: 'Excel (.xlsx)', icon: <TableChart />, description: 'Format tabulaire pour analyse et traitement' },
    { value: 'word', label: 'Word (.docx)', icon: <Description />, description: 'Format éditable pour modifications ultérieures' },
  ];

  const templates = [
    { value: 'professional', label: 'Professionnel', description: 'Design moderne et épuré' },
    { value: 'classic', label: 'Classique', description: 'Style traditionnel et formel' },
    { value: 'minimal', label: 'Minimaliste', description: 'Design simple et efficace' },
    { value: 'corporate', label: 'Corporate', description: 'Style entreprise avec logo' },
  ];

  const colorSchemes = [
    { value: 'blue', label: 'Bleu Professionnel', color: '#1976d2' },
    { value: 'green', label: 'Vert Écologique', color: '#2e7d32' },
    { value: 'purple', label: 'Violet Élégant', color: '#7b1fa2' },
    { value: 'orange', label: 'Orange Dynamique', color: '#f57c00' },
    { value: 'gray', label: 'Gris Neutre', color: '#424242' },
  ];

  const fontSizes = [
    { value: 'small', label: 'Petit', description: 'Plus de contenu par page' },
    { value: 'medium', label: 'Moyen', description: 'Taille standard recommandée' },
    { value: 'large', label: 'Grand', description: 'Plus facile à lire' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = () => {
    const exportOptions = {
      format: exportFormat,
      template,
      includeLogo,
      includeSignature,
      includeTerms,
      customHeader,
      customFooter,
      colorScheme,
      fontSize,
      tvaRate: orderData.tvaRate, // Passer le taux de TVA
    };
    
    onExport(exportFormat, exportOptions);
    onClose();
  };

  // Fonction de prévisualisation (à implémenter dans une future version)
  // const handlePreview = () => {
  //   setPreviewMode(!previewMode);
  // };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Download color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Export Avancé du Bon de Commande
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="export options">
            <Tab label="Format d'Export" icon={<PictureAsPdf />} iconPosition="start" />
            <Tab label="Personnalisation" icon={<Settings />} iconPosition="start" />
            <Tab label="Prévisualisation" icon={<Visibility />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Format d'Export */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Choisissez le Format d'Export
              </Typography>
            </Grid>
            
            {exportFormats.map((format) => (
              <Grid item xs={12} md={4} key={format.value}>
                <Paper
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    border: exportFormat === format.value ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    backgroundColor: exportFormat === format.value ? '#f3f8ff' : 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f3f8ff',
                    },
                  }}
                  onClick={() => setExportFormat(format.value)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ color: '#1976d2' }}>{format.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {format.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {format.description}
                  </Typography>
                  
                  {exportFormat === format.value && (
                    <Chip
                      label="Sélectionné"
                      color="primary"
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  )}
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Template de Design
              </Typography>
            </Grid>

            {templates.map((temp) => (
              <Grid item xs={12} md={3} key={temp.value}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: template === temp.value ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    backgroundColor: template === temp.value ? '#f3f8ff' : 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f3f8ff',
                    },
                  }}
                  onClick={() => setTemplate(temp.value)}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {temp.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {temp.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Personnalisation */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Options de Contenu
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                  />
                }
                label="Inclure le logo de l'entreprise"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                  />
                }
                label="Inclure l'espace signature"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={includeTerms}
                    onChange={(e) => setIncludeTerms(e.target.checked)}
                  />
                }
                label="Inclure les conditions générales"
                sx={{ mb: 2 }}
              />

              <TextField
                label="En-tête personnalisé"
                value={customHeader}
                onChange={(e) => setCustomHeader(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
                placeholder="Ajoutez un en-tête personnalisé..."
              />

              <TextField
                label="Pied de page personnalisé"
                value={customFooter}
                onChange={(e) => setCustomFooter(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Ajoutez un pied de page personnalisé..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Apparence
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Schéma de couleurs</InputLabel>
                <Select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  label="Schéma de couleurs"
                >
                  {colorSchemes.map((scheme) => (
                    <MenuItem key={scheme.value} value={scheme.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: scheme.color,
                          }}
                        />
                        {scheme.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Taille de police</InputLabel>
                <Select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  label="Taille de police"
                >
                  {fontSizes.map((size) => (
                    <MenuItem key={size.value} value={size.value}>
                      <Box>
                        <Typography variant="body1">{size.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {size.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Prévisualisation */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Visibility sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Prévisualisation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              La prévisualisation sera disponible dans la prochaine version
            </Typography>
            
            <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>
              <Typography variant="body2">
                Fonctionnalité en cours de développement. 
                Vous pouvez procéder à l'export directement.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
          sx={{ minWidth: 200 }}
        >
          Exporter le Bon de Commande
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedExportDialog;
