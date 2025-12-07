'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  rental_rate_per_day: number;
  capacity: number;
  available: boolean;
  images: string[];
}

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    rental_rate_per_day: 0,
    capacity: 4,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('/api/guides/vehicles', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setVehicles(res.data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/guides/vehicles', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setVehicles([...vehicles, res.data.vehicle]);
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        rental_rate_per_day: 0,
        capacity: 4,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add vehicle');
    }
  };

  const handleUploadImages = async (vehicleId: string, files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      const res = await axios.post(`/api/upload/vehicle-images`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update vehicle with images
      await axios.patch(
        `/api/guides/vehicles/${vehicleId}`,
        { images: res.data.images },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      fetchVehicles();
    } catch (error) {
      console.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await axios.delete(`/api/guides/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
    } catch (error) {
      console.error('Failed to delete vehicle');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg mb-8 shadow">
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <input
              type="text"
              placeholder="Make (e.g., Toyota)"
              value={formData.make}
              onChange={e => setFormData({ ...formData, make: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Model"
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Year"
              value={formData.year}
              onChange={e =>
                setFormData({ ...formData, year: parseInt(e.target.value) })
              }
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="License Plate"
              value={formData.license_plate}
              onChange={e =>
                setFormData({ ...formData, license_plate: e.target.value })
              }
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Daily Rate (₹)"
              value={formData.rental_rate_per_day}
              onChange={e =>
                setFormData({
                  ...formData,
                  rental_rate_per_day: parseFloat(e.target.value),
                })
              }
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={e =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) })
              }
              className="w-full border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg w-full"
            >
              Add Vehicle
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <div className="space-y-2 mb-4">
              <p>License Plate: {vehicle.license_plate}</p>
              <p>Daily Rate: ₹{vehicle.rental_rate_per_day}</p>
              <p>Capacity: {vehicle.capacity} people</p>
              <p>Status: {vehicle.available ? 'Available' : 'Unavailable'}</p>
            </div>

            {vehicle.images && vehicle.images.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Images:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {vehicle.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Vehicle ${idx}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer flex-1 text-center">
                {uploading ? 'Uploading...' : 'Upload Images'}
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={e => handleUploadImages(vehicle.id, e.target.files!)}
                  accept="image/*"
                />
              </label>
              <button
                onClick={() => handleDeleteVehicle(vehicle.id)}
                className="bg-red-600 text-white px-4 py-2 rounded flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
