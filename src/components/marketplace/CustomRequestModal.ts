// src/components/marketplace/CustomRequestModal.ts
import React, { useState } from 'react';
import { Modal, Button, Form, Input, Select, message } from 'antd';
import { User } from 'src/types/index';
import { customRequestService } from 'src/lib/customRequestService';

interface CustomRequestModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
}

const CustomRequestModal: React.FC<CustomRequestModalProps> = ({
  visible,
  onClose,
  user,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await customRequestService.createCustomRequest({
        userId: user.id,
        title: values.title,
        description: values.description,
        category: values.category,
      });
      message.success('Custom request created successfully');
      onClose();
    } catch (error) {
      message.error('Error creating custom request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title="Create Custom Request"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          Create
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Title"
          name="title"
          rules={[
            {
              required: true,
              message: 'Please input a title',
            },
          ]}
        >
          <Input placeholder="Enter title" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              required: true,
              message: 'Please input a description',
            },
          ]}
        >
          <Input.TextArea rows={4} placeholder="Enter description" />
        </Form.Item>
        <Form.Item
          label="Category"
          name="category"
          rules={[
            {
              required: true,
              message: 'Please select a category',
            },
          ]}
        >
          <Select placeholder="Select category">
            <Select.Option value="digital">Digital</Select.Option>
            <Select.Option value="physical">Physical</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomRequestModal;

// src/lib/customRequestService.ts
import axios from 'axios';
import { CustomRequest } from 'src/types/index';

const customRequestService = {
  createCustomRequest: async (data: {
    userId: number;
    title: string;
    description: string;
    category: string;
  }) => {
    try {
      const response = await axios.post('/api/custom-requests', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default customRequestService;

// src/types/index.ts
interface CustomRequest {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export { CustomRequest, User };

// src/app/api/custom-requests/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'src/lib/prisma';
import { CustomRequest } from 'src/types/index';

const createCustomRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, title, description, category } = req.body;
    const customRequest = await prisma.customRequest.create({
      data: {
        userId,
        title,
        description,
        category,
      },
    });
    res.status(201).json(customRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating custom request' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return createCustomRequest(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// prisma/schema.prisma
model CustomRequest {
  id       Int     @id @default(autoincrement())
  userId   Int
  title    String
  description String
  category String
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())
}