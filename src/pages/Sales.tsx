import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { formatCurrency } from '../lib/formatters';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  // Stack,
  MenuItem,
  IconButton,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Fade,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  styled,
  CircularProgress,
} from '@mui/material';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

type Item = Database['public']['Tables']['items']['Row'];
type SaleItem = {
  item_id: string;
  quantity: number;
  price_at_sale: number;
  discount: number;
  itemName?: string; // For display purposes
};

// const SummaryCard = styled(Card)(({ theme }) => ({
//   height: '100%',
//   display: 'flex',
//   flexDirection: 'column',
//   transition: 'all 0.3s ease',
//   '&:hover': {
//     transform: 'translateY(-4px)',
//     boxShadow: theme.shadows[4]
//   }
// }));

export function Sales() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Select Items', 'Customer Information', 'Review & Submit'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setFetchingItems(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items');
    } finally {
      setFetchingItems(false);
    }
  };

  const addSaleItem = () => {
    setSaleItems([
      ...saleItems,
      {
        item_id: '',
        quantity: 0,
        price_at_sale: 0,
        discount: 0,
        itemName: '',
      },
    ]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    const newSaleItems = [...saleItems];
    newSaleItems[index] = { ...newSaleItems[index], [field]: value };

    if (field === 'item_id') {
      const item = items.find((i) => i.id === value);
      if (item) {
        newSaleItems[index].price_at_sale = item.price;
        newSaleItems[index].itemName = item.name;
      }
    }

    setSaleItems(newSaleItems);
  };

  const calculateSubtotal = (item: SaleItem) => {
    return item.price_at_sale * item.quantity;
  };

  const calculateDiscount = (item: SaleItem) => {
    return (item.price_at_sale * item.quantity) * (item.discount / 100);
  };

  const calculateItemTotal = (item: SaleItem) => {
    return calculateSubtotal(item) - calculateDiscount(item);
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  const isStepComplete = () => {
    switch (activeStep) {
      case 0:
        return saleItems.length > 0 && saleItems.every(item => item.item_id && item.quantity !== undefined && item.quantity !== null);
      case 1:
        return customerName.trim().length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBackStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Insert sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          employee_id: user.id,
          customer_name: customerName,
          total_amount: calculateTotal(),
          discount: 0,
          notes,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Prepare sale items for insertion (remove custom fields)
      const saleItemsToInsert = saleItems.map(({ itemName, ...rest }) => ({
        sale_id: saleData.id,
        ...rest,
      }));

      // Insert sale items
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsToInsert);

      if (itemsError) throw itemsError;

      setSuccess('Sale recorded successfully!');
      setCustomerName('');
      setNotes('');
      setSaleItems([]);
      setActiveStep(0); // Reset to first step

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error creating sale:', error);
      setError('Failed to create sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingBasketIcon sx={{ mr: 1 }} />
                  Select Items
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addSaleItem}
                  size="small"
                  disabled={fetchingItems}
                >
                  Add Item
                </Button>
              </Box>

              {fetchingItems ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <>
                  {saleItems.length === 0 ? (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px dashed',
                        borderColor: 'divider'
                      }}
                    >
                      <ShoppingBasketIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No items added yet
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={addSaleItem}
                        startIcon={<AddIcon />}
                        sx={{ mt: 1 }}
                      >
                        Add Your First Item
                      </Button>
                    </Box>
                  ) : (
                    <>
                      {saleItems.map((saleItem, index) => (
                        <Fade key={index} in={true} timeout={300}>
                          <Card
                            variant="outlined"
                            sx={{
                              mb: 2,
                              p: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: 2
                              }
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  select
                                  fullWidth
                                  required
                                  label="Item"
                                  value={saleItem.item_id}
                                  onChange={(e) =>
                                    updateSaleItem(index, 'item_id', e.target.value)
                                  }
                                  size={isSmallScreen ? "small" : "medium"}
                                >
                                  {items.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                      {item.name} - {formatCurrency(item.price)}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>

                              <Grid item xs={5} sm={2}>
                                <TextField
                                  fullWidth
                                  required
                                  type="number"
                                  label="Quantity"
                                  value={saleItem.quantity}
                                  onChange={(e) =>
                                    updateSaleItem(index, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))
                                  }
                                  inputProps={{ min: 1 }}
                                  size={isSmallScreen ? "small" : "medium"}
                                />
                              </Grid>

                              <Grid item xs={7} sm={3}>
                                <TextField
                                  fullWidth
                                  required
                                  type="number"
                                  label="Discount %"
                                  value={saleItem.discount}
                                  onChange={(e) =>
                                    updateSaleItem(index, 'discount', parseFloat(e.target.value) || 0)
                                  }
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                  }}
                                  inputProps={{ min: 0, max: 100, step: 5 }}
                                  size={isSmallScreen ? "small" : "medium"}
                                />
                              </Grid>

                              <Grid item xs={10} sm={1} sx={{ textAlign: 'center' }}>
                                <Tooltip title="Remove item">
                                  <IconButton
                                    onClick={() => removeSaleItem(index)}
                                    color="error"
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Grid>

                              {saleItem.item_id && (
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Subtotal: {formatCurrency(calculateSubtotal(saleItem))}
                                    </Typography>

                                    {saleItem.discount > 0 && (
                                      <Typography variant="body2" color="error">
                                        Discount: -{formatCurrency(calculateDiscount(saleItem))}
                                      </Typography>
                                    )}

                                    <Typography variant="subtitle2">
                                      Item Total: {formatCurrency(calculateItemTotal(saleItem))}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                          </Card>
                        </Fade>
                      ))}

                      <Box sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Typography variant="h6">
                          Total: {formatCurrency(calculateTotal())}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={addSaleItem}
                          startIcon={<AddIcon />}
                          size="small"
                        >
                          Add Another Item
                        </Button>
                      </Box>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                Customer Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional information about this sale"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                Review Sale
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Customer
                </Typography>
                <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="body1">
                    {customerName}
                  </Typography>
                  {notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Notes: {notes}
                    </Typography>
                  )}
                </Card>

                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Items
                </Typography>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <Box sx={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    p: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,.2)',
                      borderRadius: '4px',
                    }
                  }}>
                    {saleItems.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          py: 1,
                          px: 2,
                          borderBottom: index < saleItems.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="body1">
                            {item.itemName || items.find(i => i.id === item.item_id)?.name || 'Unknown Item'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(item.price_at_sale)} × {item.quantity}
                            {item.discount > 0 && ` (${item.discount}% discount)`}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2">
                          {formatCurrency(calculateItemTotal(item))}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle1">Total Amount</Typography>
                  <Typography variant="h6">{formatCurrency(calculateTotal())}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return <Box>Unknown step</Box>;
    }
  };

  // When the operation is complete
  if (success) {
    return (
      <Fade in={!!success}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="success.main" gutterBottom>
            Sale Completed Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            The sale has been recorded in the system.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSuccess('');
              addSaleItem();
            }}
            sx={{ mt: 2 }}
          >
            Create New Sale
          </Button>
        </Card>
      </Fade>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(to right bottom, #1f2937, #111827)'
            : 'linear-gradient(to right bottom, #f9fafb, #f3f4f6)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            New Sale
          </Typography>

          <Chip
            label="In Progress"
            color="primary"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Create a new sales transaction by adding items, customer information, and reviewing the sale.
        </Typography>
      </Paper>

      {error && (
        <Collapse in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Collapse>
      )}

      {/* Stepper */}
      <Box sx={{ mb: 4, display: { xs: 'none', sm: 'block' } }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Mobile stepper (text only) */}
      <Box sx={{ mb: 2, display: { xs: 'block', sm: 'none' } }}>
        <Typography variant="subtitle1" color="text.secondary" align="center">
          Step {activeStep + 1} of {steps.length}: <strong>{steps[activeStep]}</strong>
        </Typography>
      </Box>

      {/* Step content */}
      {renderStep(activeStep)}

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBackStep}
          disabled={activeStep === 0}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleNextStep}
          disabled={loading || !isStepComplete()}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {activeStep === steps.length - 1 ? 'Complete Sale' : 'Next'}
        </Button>
      </Box>

      {/* Helpful information */}
      {activeStep === 0 && saleItems.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', alignItems: 'flex-start' }}>
          <InfoIcon color="info" sx={{ mr: 1, mt: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Tip:</strong> You can add multiple items to a sale. Don't forget to set the correct quantity and apply any discounts if needed.
          </Typography>
        </Box>
      )}
    </Box>
  );
}