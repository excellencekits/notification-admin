'use client';

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

interface ProductCard16Props {
  selectedProduct: any;
  handleProductComments?: () => void;
  storeLocations?: any[];
}

export default function ProductCard16({ selectedProduct, handleProductComments, storeLocations }: ProductCard16Props) {
  const hasDiscount = selectedProduct?.salePrice && selectedProduct?.salePrice < selectedProduct?.price;
  const discountPercent = hasDiscount ? Math.round(((selectedProduct.price - selectedProduct.salePrice) / selectedProduct.price) * 100) : 0;

  const isLowStock = selectedProduct?.stock > 0 && selectedProduct?.stock <= 10;
  const isOutOfStock = selectedProduct?.stock === 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8]
        }
      }}
    >
      {/* Product Image */}
      <Box>
        <CardMedia
          component="img"
          height="200"
          image={selectedProduct?.thumbnail?.medium || selectedProduct?.thumbnail?.thumbnail || '/placeholder.png'}
          alt={selectedProduct?.name}
          sx={{
            objectFit: 'cover',
            backgroundColor: (theme) => alpha(theme.palette.grey[200], 0.5)
          }}
        />

        {/* Badges */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            flexWrap: 'wrap',
            gap: 0.5
          }}
        >
          {hasDiscount && <Chip label={`-${discountPercent}%`} size="small" color="error" sx={{ fontWeight: 600 }} />}
          {selectedProduct?.featured && <Chip label="Featured" size="small" color="primary" sx={{ fontWeight: 600 }} />}
        </Stack>

        {/* Stock Status Badge */}
        {(isLowStock || isOutOfStock) && (
          <Chip
            label={isOutOfStock ? 'Out of Stock' : 'Low Stock'}
            size="small"
            color={isOutOfStock ? 'default' : 'warning'}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              fontWeight: 600
            }}
          />
        )}
      </Box>

      {/* Product Details */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Product Name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 1,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3em'
          }}
        >
          {selectedProduct?.name}
        </Typography>

        {/* SKU and Category */}
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            SKU: {selectedProduct?.sku}
          </Typography>
          {selectedProduct?.categoryName && (
            <Typography variant="caption" color="text.secondary">
              Category: {selectedProduct?.categoryName}
            </Typography>
          )}
        </Stack>

        {/* Description (if available) */}
        {selectedProduct?.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {selectedProduct.description}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Price Section */}
        <Box sx={{ mt: 'auto' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            {hasDiscount ? (
              <>
                <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
                  ${selectedProduct.salePrice?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ${selectedProduct.price?.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                ${selectedProduct?.price?.toFixed(2) || '0.00'}
              </Typography>
            )}
          </Stack>

          {/* Stock Information */}
          <Typography
            variant="caption"
            color={isOutOfStock ? 'error' : isLowStock ? 'warning.main' : 'success.main'}
            sx={{ fontWeight: 500 }}
          >
            {isOutOfStock ? 'Currently unavailable' : `${selectedProduct?.stock || 0} in stock`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
