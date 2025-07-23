import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/admin/employees');
  }, [navigate]);
  return null;
} 