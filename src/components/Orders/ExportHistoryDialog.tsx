import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Description,
  History,
  Download,
  Delete,
  Visibility,
} from '@mui/icons-material';

interface ExportHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ExportRecord {
  id: number;
  orderNumber: string;
  format: string;
  options: any;
  timestamp: string;
  total: number;
  itemCount: number;
}

const ExportHistoryDialog: React.FC<ExportHistoryDialogProps> = ({
  open,
  onClose,
}) => {
  const [history, setHistory] = useState<ExportRecord[]>([]);

  useEffect(() => {
    if (open) {
      const storedHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]');
      setHistory(storedHistory);
    }
  }, [open]);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'excel':
        return <TableChart color="success" />;
      case 'word':
        return <Description color="primary" />;
      default:
        return <Download />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'excel':
        return 'Excel';
      case 'word':
        return 'Word';
      default:
        return format.toUpperCase();
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  const clearHistory = () => {
    localStorage.removeItem('exportHistory');
    setHistory([]);
  };

  const deleteRecord = (id: number) => {
    const updatedHistory = history.filter(record => record.id !== id);
    localStorage.setItem('exportHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <History color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Historique des Exports
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {history.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <History sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Aucun export enregistré
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les exports de vos bons de commande apparaîtront ici
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {history.length} export(s) trouvé(s)
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={clearHistory}
              >
                Vider l'historique
              </Button>
            </Box>

            <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {history.map((record, index) => (
                  <React.Fragment key={record.id}>
                    <ListItem
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <ListItemIcon>
                        {getFormatIcon(record.format)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {record.orderNumber}
                            </Typography>
                            <Chip
                              label={getFormatLabel(record.format)}
                              size="small"
                              color={
                                record.format === 'pdf' ? 'error' :
                                record.format === 'excel' ? 'success' : 'primary'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(record.timestamp)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={`${record.itemCount} produit(s)`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={formatCurrency(record.total)}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir les détails">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteRecord(record.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    
                    {index < history.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Note :</strong> L'historique est stocké localement dans votre navigateur. 
                Il sera conservé jusqu'à ce que vous le supprimiez ou que vous vidiez les données de navigation.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportHistoryDialog;
