import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { MarketProperty, Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const MarketPage: React.FC = () => {
  const properties = useGameStore(state => state.properties);
  const purchaseProperty = useGameStore(state => state.purchaseProperty);
  const marketProperties = useGameStore(state => state.marketProperties);
  const refreshMarket = useGameStore(state => state.refreshMarket);
  const [activeTab, setActiveTab] = useState('portfolio');
  
  const handlePurchase = (property: MarketProperty) => {
    const newProperty: Omit<Property, 'id' | 'createdAt'> = {
      address: property.address,
      price: property.price,
      condition: property.condition,
      epcRating: property.epcRating,
      squareFootage: property.squareFootage,
      neighborhoodCeiling: property.neighborhoodCeiling,
      renovations: [],
      furnishingLevel: 'basic',
      conditionScore: property.condition === 'dilapidated' ? 30 : property.condition === 'standard' ? 60 : 90,
    };
    
    purchaseProperty(newProperty);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="market">Market Listings</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" onClick={refreshMarket} className="ml-4">
          Refresh Market
        </Button>
      </div>
      
      <TabsContent value="portfolio" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Property Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">You don't own any properties yet. Browse the market to find your first investment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="market" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Available Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketProperties
                .filter(p => p.source === 'estateAgent')
                .map(property => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{property.address}</h3>
                        <Badge variant="secondary">{property.source}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">£{Math.round(property.price / 100).toLocaleString()}</Badge>
                        <Badge variant="outline">{property.condition}</Badge>
                        <Badge variant="outline">EPC: {property.epcRating}</Badge>
                        <Badge variant="outline">{property.squareFootage} sq ft</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Completion: {property.completionTimeline} days</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Max Rent: £{Math.round(property.neighborhoodCeiling / 100).toLocaleString()}/mo</p>
                        </div>
                        <Button 
                          onClick={() => handlePurchase(property)}
                          disabled={useGameStore.getState().finances.cash < property.price}
                        >
                          Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="auctions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Auction Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketProperties
                .filter(p => p.source === 'auction')
                .map(property => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{property.address}</h3>
                        <Badge variant="destructive">{property.source}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">£{Math.round(property.price / 100).toLocaleString()}</Badge>
                        <Badge variant="outline">{property.condition}</Badge>
                        <Badge variant="outline">EPC: {property.epcRating}</Badge>
                        <Badge variant="outline">{property.squareFootage} sq ft</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <p className="text-sm text-red-600 dark:text-red-400">Auction Completion: {property.completionTimeline} days</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Max Rent: £{Math.round(property.neighborhoodCeiling / 100).toLocaleString()}/mo</p>
                        </div>
                        <Button 
                          variant="destructive"
                          onClick={() => handlePurchase(property)}
                          disabled={useGameStore.getState().finances.cash < property.price}
                        >
                          Bid Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
