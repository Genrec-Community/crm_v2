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
  MenuItem,
  IconButton,
  Grid,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Fade,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  Stepper,
  Step,
  StepLabel,
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// PDF imports
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Item = Database['public']['Tables']['items']['Row'];
type QuoteItem = {
  item_id: string;
  quantity: number;
  price_at_sale: number;
  discount: number;
  itemName?: string; // For display purposes
};

export function Quote() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // Custom currency formatter for PDF (removes spacing issues)
  const formatCurrencyForPDF = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const steps = ['Select Items', 'Customer Information', 'Generate Quote'];

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

  const addQuoteItem = () => {
    setQuoteItems([
      ...quoteItems,
      {
        item_id: '',
        quantity: 0,
        price_at_sale: 0,
        discount: 0,
        itemName: '',
      },
    ]);
  };

  const removeQuoteItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newQuoteItems = [...quoteItems];
    newQuoteItems[index] = { ...newQuoteItems[index], [field]: value };

    if (field === 'item_id') {
      const item = items.find((i) => i.id === value);
      if (item) {
        newQuoteItems[index].price_at_sale = item.price;
        newQuoteItems[index].itemName = item.name;
      }
    }

    setQuoteItems(newQuoteItems);
  };

  const calculateSubtotal = (item: QuoteItem) => {
    return item.price_at_sale * item.quantity;
  };

  const calculateDiscount = (item: QuoteItem) => {
    return (item.price_at_sale * item.quantity) * (item.discount / 100);
  };

  const calculateItemTotal = (item: QuoteItem) => {
    return calculateSubtotal(item) - calculateDiscount(item);
  };

  const calculateTotal = () => {
    return quoteItems.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  const isStepComplete = () => {
    switch (activeStep) {
      case 0:
        return quoteItems.length > 0 && quoteItems.every(item => item.item_id && item.quantity !== undefined && item.quantity !== null);
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
      generatePDF();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBackStep = () => {
    setActiveStep(activeStep - 1);
  };

  const generateQuoteHTML = () => {
    const subtotal = calculateTotal();
    const totalDiscount = quoteItems.reduce((total, item) => total + calculateDiscount(item), 0);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Quote - ${customerName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
                line-height: 1.4;
            }
            .content-wrapper {
                padding: 5px 20px;
                max-width: 794px;
                margin: 0 auto;
            }
            .logo {
                text-align: center;
                margin-bottom: 10px;
                margin-top: 0px;
            }
            .logo img {
                max-width: 120px;
                height: auto;
            }
            .header {
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #2980b9;
                padding-bottom: 10px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            .company-details {
                font-size: 12px;
                color: #7f8c8d;
                margin-bottom: 15px;
            }
            .quote-title {
                background-color: #e74c3c;
                color: white;
                padding: 8px 20px;
                display: inline-block;
                font-size: 16px;
                font-weight: bold;
                border-radius: 4px;
            }
            .customer-info {
                margin: 10px 0;
                background-color: #ecf0f1;
                padding: 15px;
                border-radius: 5px;
            }
            .customer-details h4 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 14px;
            }
            .customer-details p {
                margin: 5px 0;
                font-size: 12px;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .items-table th {
                background-color: #e74c3c;
                color: white;
                padding: 12px 8px;
                text-align: center;
                font-size: 12px;
                font-weight: bold;
            }
            .items-table td {
                padding: 10px 8px;
                text-align: center;
                border-bottom: 1px solid #ecf0f1;
                font-size: 11px;
            }
            .items-table td:first-child {
                text-align: left;
            }
            .items-table td:last-child, .items-table td:nth-child(2) {
                text-align: right;
            }
            .items-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .total-row {
                background-color: #2c3e50 !important;
                color: white;
                font-weight: bold;
            }
            .summary-section {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
            }
            .summary-table {
                width: 300px;
                border-collapse: collapse;
            }
            .summary-table td {
                padding: 8px 12px;
                border-bottom: 1px solid #ecf0f1;
                font-size: 12px;
            }
            .summary-table td:first-child {
                text-align: left;
                font-weight: bold;
            }
            .summary-table td:last-child {
                text-align: right;
            }
            .total-amount {
                background-color: #2c3e50;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            .notes-section {
                margin-top: 30px;
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
            }
            .notes-section h4 {
                margin: 0 0 10px 0;
                color: #2c3e50;
            }

            .signature-section {
                margin-top: 50px;
                text-align: right;
            }
            .signature-line {
                border-top: 1px solid #333;
                width: 200px;
                margin: 50px 0 10px auto;
            }
        </style>
    </head>
    <body>
        <div class="content-wrapper">
            <div class="logo">
            <img src="/Dhishank Final With Compass.png" alt="Dhishank Logo" />
        </div>

        <div class="header">
            <div class="company-name">Dhishank Surveying & Constructions</div>
            <div class="company-details">
                149 LRS Palayam, Tenkasi, Tamil Nadu<br>
                Phone: 9489837602<br>
                Email: dhishanksurveying10kas@gmail.com
            </div>
            <div class="quote-title">Quote</div>
        </div>

        <div class="customer-info">
            <div class="customer-details">
                <h4>Billed To:</h4>
                <p><strong>${customerName}</strong></p>
                ${customerEmail ? `<p>Email: ${customerEmail}</p>` : ''}
                ${customerPhone ? `<p>Phone: ${customerPhone}</p>` : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Price/Unit</th>
                    <th>Discount</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${quoteItems.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.itemName || 'Unknown Item'}</td>
                        <td>${item.quantity}</td>
                        <td>Nos</td>
                        <td>₹${item.price_at_sale.toFixed(2)}</td>
                        <td>₹${calculateDiscount(item).toFixed(2)} (${item.discount}%)</td>
                        <td>₹${calculateItemTotal(item).toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="2"><strong>Total</strong></td>
                    <td><strong>${quoteItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></td>
                    <td colspan="3"></td>
                    <td><strong>₹${subtotal.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="summary-section">
            <table class="summary-table">
                <tr>
                    <td>Sub Total:</td>
                    <td>₹${(subtotal + totalDiscount).toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Discount:</td>
                    <td>₹${totalDiscount.toFixed(2)}</td>
                </tr>
                <tr class="total-amount">
                    <td>Total:</td>
                    <td>₹${subtotal.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        ${notes ? `
        <div class="notes-section">
            <h4>Terms and Conditions:</h4>
            <p>${notes}</p>
        </div>
        ` : ''}

            <div class="signature-section">
                <p>For Dhishank Surveying & Construction</p>
                <div class="signature-line"></div>
                <p style="margin: 5px 0; font-style: italic;">Authorized Signatory</p>
                <p style="font-size: 10px; font-style: italic;">Thank you for your business!<br>Visit again!</p>
            </div>
        </div>

    </body>
    </html>
    `;
  };

  const generatePDF = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      console.log('Starting PDF generation...');

      // Generate HTML content
      const htmlContent = generateQuoteHTML();

      // Create a temporary div to render HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '834px'; // A4 width (794px) + padding (20px * 2 = 40px)
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);

      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Clean up
      document.body.removeChild(tempDiv);

      // Create PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;

      let imgWidth = pdfWidth;
      let imgHeight = pdfWidth * canvasAspectRatio;

      // If image is taller than page, scale it down
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = pdfHeight / canvasAspectRatio;
      }

      // Center the image
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      // Save the PDF
      const fileName = `quote-${customerName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      doc.save(fileName);

      setSuccess('Quote PDF generated successfully!');

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setNotes('');
    setQuoteItems([]);
    setActiveStep(0);
    setSuccess('');
  };

  // When the operation is complete
  if (success) {
    return (
      <Fade in={!!success}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="success.main" gutterBottom>
            Quote Generated Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            The quote PDF has been downloaded to your device.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={resetForm}
            sx={{ mt: 2 }}
          >
            Create New Quote
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Create Quote
          </Typography>
          <Box
            component="img"
            src="/Dhishank Final With Compass.png"
            alt="Dhishank Logo"
            sx={{
              height: 80,
              width: 'auto',
              ml: 2
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Create a professional quote by adding items, customer information, and generating a PDF.
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
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
        >
          {activeStep === steps.length - 1 ? 'Generate PDF' : 'Next'}
        </Button>
      </Box>

      {/* Helpful information */}
      {activeStep === 0 && quoteItems.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', alignItems: 'flex-start' }}>
          <InfoIcon color="info" sx={{ mr: 1, mt: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Tip:</strong> You can add multiple items to a quote. Set the correct quantity and apply any discounts as needed.
          </Typography>
        </Box>
      )}
    </Box>
  );

  function renderStep(step: number) {
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
                  onClick={addQuoteItem}
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
                  {quoteItems.length === 0 ? (
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
                        onClick={addQuoteItem}
                        startIcon={<AddIcon />}
                        sx={{ mt: 1 }}
                      >
                        Add Your First Item
                      </Button>
                    </Box>
                  ) : (
                    <>
                      {quoteItems.map((quoteItem, index) => (
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
                                  value={quoteItem.item_id}
                                  onChange={(e) =>
                                    updateQuoteItem(index, 'item_id', e.target.value)
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
                                  value={quoteItem.quantity}
                                  onChange={(e) =>
                                    updateQuoteItem(index, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))
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
                                  value={quoteItem.discount}
                                  onChange={(e) =>
                                    updateQuoteItem(index, 'discount', parseFloat(e.target.value) || 0)
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
                                    onClick={() => removeQuoteItem(index)}
                                    color="error"
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Grid>

                              {quoteItem.item_id && (
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Subtotal: {formatCurrency(calculateSubtotal(quoteItem))}
                                    </Typography>

                                    {quoteItem.discount > 0 && (
                                      <Typography variant="body2" color="error">
                                        Discount: -{formatCurrency(calculateDiscount(quoteItem))}
                                      </Typography>
                                    )}

                                    <Typography variant="subtitle2">
                                      Item Total: {formatCurrency(calculateItemTotal(quoteItem))}
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
                          onClick={addQuoteItem}
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

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email (Optional)"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
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
                    placeholder="Enter any additional information for this quote"
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
                Review Quote
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="500">
                  Customer
                </Typography>
                <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="body1">
                    {customerName}
                  </Typography>
                  {customerEmail && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Email: {customerEmail}
                    </Typography>
                  )}
                  {customerPhone && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Phone: {customerPhone}
                    </Typography>
                  )}
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
                    {quoteItems.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          py: 1,
                          px: 2,
                          borderBottom: index < quoteItems.length - 1 ? '1px solid' : 'none',
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
  }
}
