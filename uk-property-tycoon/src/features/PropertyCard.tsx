import React from 'react';
import type { Property } from '../types';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Users, Gauge, Ruler, Award } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const tenant = property.tenant;
  
  return (
    <Card className="overflow-hidden">
      <div className={`p-4 ${
        property.condition === 'dilapidated' ? 'bg-red-50 dark:bg-red-900/20' : 
        property.condition === 'standard' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'
      } border-b`}>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg truncate">{property.address}</h3>
          <Badge 
            variant={
              property.condition === 'dilapidated' ? 'destructive' : 
              property.condition === 'standard' ? 'default' : 'secondary'
            }
          >
            {property.condition}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="outline">£{Math.round(property.price / 100).toLocaleString()}</Badge>
          <Badge variant="outline">EPC: {property.epcRating}</Badge>
          <Badge variant="outline">{property.squareFootage} sq ft</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <Ruler className="w-4 h-4 mr-1" />
          <span>{property.squareFootage} sq ft</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <Gauge className="w-4 h-4 mr-1" />
          <span>Condition: {property.conditionScore}%</span>
        </div>
        
        {tenant ? (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4 mr-1" />
              <span>Tenant: {tenant.type}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Award className="w-4 h-4 mr-1" />
              <span>Rent: £{Math.round(tenant.rentAmount / 100).toLocaleString()}/mo</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${tenant.satisfaction}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Satisfaction: {tenant.satisfaction}%</div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">No tenant</div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between">
        <Button variant="outline" size="sm">Manage</Button>
        <Button variant="outline" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  );
};
