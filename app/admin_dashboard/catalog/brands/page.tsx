"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Brand {
  brand_id: number;
  brand_name: string;
  country: string;
}

export default function SimpleBrandList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // GET request with axios
    axios.get('http://127.0.0.1:8000/brands/')
      .then((response) => {
        setBrands(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching brands:', error);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this brand?')) {
      try {
        // DELETE request with axios
        await axios.delete(`http://127.0.0.1:8000/brands/${id}`);
        setBrands(brands.filter((b) => b.brand_id !== id));
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Failed to delete brand');
      }
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ...existing code...


  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Brand List</h1>
        
        {/* 2. Add New Page එකට යන්න Button එකක් */}
        <Link href="/admin_dashboard/catalog/brands/new">
          <button style={{ padding: '10px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
            + Add New Brand
          </button>
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search brands..."
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', width: '300px', marginBottom: '20px', border: '1px solid #ccc' }}
      />

      <table border={1} cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th>
            <th>Brand Name</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4}>Loading...</td></tr>
          ) : (
            filteredBrands.map((brand) => (
              <tr key={brand.brand_id}>
                <td>{brand.brand_id}</td>
                <td>{brand.brand_name}</td>
                <td>{brand.country}</td>
                <td>
                  {/* 3. Edit Page එකට යන්න Link එකක් */}
                  <Link href={`/admin_dashboard/catalog/brands/${brand.brand_id}`}>
                    <button style={{ background: 'blue', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px' }}>
                      Edit
                    </button>
                  </Link>

                  <button 
                    onClick={() => handleDelete(brand.brand_id)}
                    style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
