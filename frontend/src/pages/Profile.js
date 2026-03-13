import React from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="text-lg font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <p className="text-lg font-medium capitalize">{user?.role}</p>
            </div>
            {user?.location && (
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <p className="text-lg font-medium">{user.location}</p>
              </div>
            )}
            {user?.phone && (
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="text-lg font-medium">{user.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
