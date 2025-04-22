import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDateTime } from '../lib/formatters';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  // Stack,
  MenuItem,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Collapse,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';

// Icons
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DateRangeIcon from '@mui/icons-material/DateRange';
// import PersonIcon from '@mui/icons-material/Person';

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Equipment',
  'Travel',
  'Meals',
  'Utilities',
  'Maintenance',
  'Rent',
  'Insurance',
  'Software',
  'Marketing',
  'Other',
];

interface ExpenseData {
  id: string;
  category: string;
  amount: number;
  description: string;
  created_at: string;
}

export function Expenses() {
  const { user } = useAuth();
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseData[]>([]);
  const [fetchingExpenses, setFetchingExpenses] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const fetchRecentExpenses = async () => {
    if (!user) return;

    try {
      setFetchingExpenses(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentExpenses(data || []);

      // Calculate total expenses
      const { data: totalData, error: totalError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('employee_id', user.id);

      if (totalError) throw totalError;

      const total = totalData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      setTotalExpenses(total);

    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load recent expenses');
    } finally {
      setFetchingExpenses(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentExpenses();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const { error: expenseError, data } = await supabase.from('expenses').insert({
        employee_id: user.id,
        category,
        amount: parseFloat(amount),
        description,
      }).select();

      if (expenseError) throw expenseError;

      setSuccess('Expense recorded successfully');

      // Add new expense to recent expenses list
      if (data && data.length > 0) {
        setRecentExpenses(prev => [data[0], ...prev.slice(0, 4)]);
        setTotalExpenses(prev => prev + parseFloat(amount));
      }

      setCategory('');
      setAmount('');
      setDescription('');

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (error) {
      console.error('Error creating expense:', error);
      setError('Failed to record expense');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Grid container spacing={3}>
      {/* Left side - Expense Form */}
      <Grid item xs={12} md={6}>
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
            <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              Record Expense
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Track business expenses by filling out the form below.
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

        {success && (
          <Fade in={!!success}>
            <Alert
              severity="success"
              sx={{ mb: 3 }}
              icon={<CheckCircleIcon fontSize="inherit" />}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          </Fade>
        )}

        <Card variant="outlined" sx={{ mb: { xs: 3, md: 0 } }}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                      labelId="category-select-label"
                      id="category-select"
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon />
                        </InputAdornment>
                      }
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the type of expense</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Enter the expense amount"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter details about this expense"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5, mr: 1 }}>
                          <DescriptionIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Provide a detailed description of the expense"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || !category || !amount}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ReceiptIcon />}
                    >
                      Record Expense
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Right side - Recent Expenses and Summary */}
      <Grid item xs={12} md={6}>
        <Card
          variant="outlined"
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalAtmIcon sx={{ mr: 1 }} />
              Expense Summary
            </Typography>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2
            }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Expenses Recorded
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {formatCurrency(totalExpenses)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <DateRangeIcon sx={{ mr: 1, fontSize: 20 }} />
              Recent Expenses
            </Typography>

            {fetchingExpenses ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : recentExpenses.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 4,
                px: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }}>
                <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  No expenses recorded yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start tracking your expenses using the form
                </Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {recentExpenses.map((expense) => (
                  <ListItem
                    key={expense.id}
                    alignItems="flex-start"
                    sx={{
                      px: 0,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Chip
                        size="small"
                        label={formatCurrency(expense.amount)}
                        color="primary"
                        variant="outlined"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={expense.category}
                      secondary={
                        <Box>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              display: 'block',
                              color: 'text.primary',
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          >
                            {expense.description}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDateTime(expense.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}