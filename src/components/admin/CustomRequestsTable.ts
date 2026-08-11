// src/components/admin/CustomRequestsTable.ts
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import { CustomRequest } from '../../../types';
import { AiOutlineSearch } from 'react-icons/ai';
import { AiOutlineDelete } from 'react-icons/ai';
import { AiOutlineEdit } from 'react-icons/ai';
import { AiOutlineEye } from 'react-icons/ai';
import { toast } from 'react-toastify';

interface CustomRequestsTableProps {
  customRequests: CustomRequest[];
}

const CustomRequestsTable: React.FC<CustomRequestsTableProps> = ({ customRequests }) => {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomRequests, setFilteredCustomRequests] = useState(customRequests);

  useEffect(() => {
    const filteredRequests = customRequests.filter((request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomRequests(filteredRequests);
  }, [searchTerm, customRequests]);

  const handleDelete = async (id: number) => {
    try {
      await prisma.customRequest.delete({
        where: { id },
      });
      toast.success('Custom request deleted successfully');
      setFilteredCustomRequests(filteredCustomRequests.filter((request) => request.id !== id));
    } catch (error) {
      toast.error('Error deleting custom request');
    }
  };

  const handleEdit = (id: number) => {
    // Navigate to edit page
  };

  const handleView = (id: number) => {
    // Navigate to view page
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold">Custom Requests</h2>
        <div className="flex items-center">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search custom requests"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <AiOutlineSearch className="ml-2 text-gray-500" />
        </div>
      </div>
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomRequests.map((request) => (
            <tr key={request.id}>
              <td className="px-4 py-2">{request.title}</td>
              <td className="px-4 py-2">{request.description}</td>
              <td className="px-4 py-2">{request.status}</td>
              <td className="px-4 py-2 flex justify-end">
                <button
                  className="px-4 py-2 text-gray-500 hover:text-gray-900"
                  onClick={() => handleView(request.id)}
                >
                  <AiOutlineEye />
                </button>
                <button
                  className="px-4 py-2 text-gray-500 hover:text-gray-900"
                  onClick={() => handleEdit(request.id)}
                >
                  <AiOutlineEdit />
                </button>
                <button
                  className="px-4 py-2 text-gray-500 hover:text-gray-900"
                  onClick={() => handleDelete(request.id)}
                >
                  <AiOutlineDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomRequestsTable;