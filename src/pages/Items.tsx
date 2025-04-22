import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { formatCurrency, formatDate } from '../lib/formatters';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  IconButton,
  Chip,
  Collapse,
  useTheme,
  CircularProgress,
  Tooltip,
  TablePagination,
  Fade,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SortIcon from '@mui/icons-material/Sort';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PriceChangeIcon from '@mui/icons-material/PriceChange';

type Item = Database['public']['Tables']['items']['Row'];

export function Items() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<string>('name');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    // Filter and sort items
    let result = [...items];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        item => item.name.toLowerCase().includes(lowerSearchTerm) || 
                item.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, sortOption]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const { error: itemError, data } = await supabase.from('items').insert({
        name,
        price: parseFloat(price),
        description,
      }).select();

      if (itemError) throw itemError;

      // Add the newly created item to the existing items list
      if (data && data.length > 0) {
        setItems(prevItems => [...prevItems, data[0]]);
      }

      setSuccess('Item added successfully');
      setName('');
      setPrice('');
      setDescription('');
      setShowForm(false);
      
      // Auto-hide success message
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error creating item:', error);
      setError('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated items
  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Mobile card view for each item
  const renderItemCard = (item: Item) => (
    <Card 
      key={item.id} 
      sx={{ 
        mb: 2, 
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
            {item.name}
          </Typography>
          <Chip 
            label={formatCurrency(item.price)}
            color="primary" 
            size="small" 
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Added: {formatDate(item.created_at)}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ flexGrow: 1, mb: { xs: 1, sm: 0 } }}>
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
            Inventory Items
          </Typography>
          
          <Button
            variant="contained"
            startIcon={showForm ? <CloseIcon /> : <AddIcon />}
            onClick={() => setShowForm(!showForm)}
            color={showForm ? "inherit" : "primary"}
            sx={{ ml: { xs: 0, sm: 2 } }}
          >
            {showForm ? 'Cancel' : 'Add New Item'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage your inventory by adding new items and viewing existing ones.
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
        <Collapse in={!!success}>
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccess('')}
            icon={<CheckCircleIcon fontSize="inherit" />}
          >
            {success}
          </Alert>
        </Collapse>
      )}

      <Collapse in={showForm}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="div" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <AddCircleOutlineIcon sx={{ mr: 1 }} />
              Add New Item
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Item Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PriceChangeIcon />
                        </InputAdornment>
                      ),
                    }}
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
                    placeholder="Enter a detailed description of the item"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => setShowForm(false)}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !name || !price}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      Add Item
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                  labelId="sort-select-label"
                  value={sortOption}
                  label="Sort By"
                  onChange={(e) => setSortOption(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="price_asc">Price (Low to High)</MenuItem>
                  <MenuItem value="price_desc">Price (High to Low)</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {fetchingItems ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4, 
              px: 2, 
              bgcolor: 'background.default',
              borderRadius: 1
            }}>
              <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              {searchTerm ? (
                <>
                  <Typography variant="h6" gutterBottom>No items match your search</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try using different keywords or clear your search
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>No items in inventory</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start by adding some items to your inventory
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => setShowForm(true)}
                  >
                    Add First Item
                  </Button>
                </>
              )}
            </Box>
          ) : isMobile ? (
            // Mobile view - card layout
            <Box>
              {searchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Showing {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} for "{searchTerm}"
                </Typography>
              )}
              <Fade in={true}>
                <Box>
                  {paginatedItems.map(item => renderItemCard(item))}
                </Box>
              </Fade>
              <TablePagination
                component="div"
                count={filteredItems.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Box>
          ) : (
            // Desktop view - table layout
            <>
              {searchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Showing {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} for "{searchTerm}"
                </Typography>
              )}
              <TableContainer sx={{ 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell width="30%">Name</TableCell>
                      <TableCell width="15%" align="right">Price</TableCell>
                      <TableCell width="55%">Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow 
                        key={item.id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={formatCurrency(item.price)}
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip 
                            title={item.description} 
                            placement="top" 
                            arrow
                            enterDelay={700}
                            enterNextDelay={700}
                          >
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical' 
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredItems.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}