import React, { useState, useEffect } from 'react';
import {
  Container, Card, Table, Button, Badge, Modal,
  Form, Row, Col, Spinner, InputGroup
} from 'react-bootstrap';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaImage,
  FaCar, FaCheck, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { carsAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'sedan',
    pricePerDay: '',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: '',
    licensePlate: '',
    color: '',
    description: '',
    features: [],
    images: [''],
    available: true
  });

  const carTypes = ['sedan', 'suv', 'sports', 'luxury', 'compact', 'van', 'truck'];
  const transmissionTypes = ['automatic', 'manual'];
  const fuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid'];
  const featureOptions = [
    'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera',
    'Leather Seats', 'Sunroof', 'Heated Seats', 'Apple CarPlay',
    'Android Auto', 'Cruise Control', 'Blind Spot Monitor', 'Lane Assist'
  ];

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await carsAPI.getAll({ limit: 100 });
      setCars(response.data.data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Error loading cars');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        brand: car.brand || '',
        model: car.model || '',
        year: car.year || new Date().getFullYear(),
        type: car.type || 'sedan',
        pricePerDay: car.pricePerDay || '',
        seats: car.seats || 5,
        transmission: car.transmission || 'automatic',
        fuelType: car.fuelType || 'gasoline',
        mileage: car.mileage || '',
        licensePlate: car.licensePlate || '',
        color: car.color || '',
        description: car.description || '',
        features: car.features || [],
        images: car.images?.length > 0 ? car.images : [''],
        available: car.available !== false
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'sedan',
        pricePerDay: '',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'gasoline',
        mileage: '',
        licensePlate: '',
        color: '',
        description: '',
        features: [],
        images: [''],
        available: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCar(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== '')
      };

      if (editingCar) {
        await carsAPI.update(editingCar._id, submitData);
        toast.success('Car updated successfully');
      } else {
        await carsAPI.create(submitData);
        toast.success('Car created successfully');
      }

      handleCloseModal();
      fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving car');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    setDeleting(carId);
    try {
      await carsAPI.delete(carId);
      toast.success('Car deleted successfully');
      fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting car');
    } finally {
      setDeleting(null);
    }
  };

  const filteredCars = cars.filter(car =>
    `${car.brand} ${car.model} ${car.type} ${car.licensePlate}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Manage Cars</h2>
              <p className="text-muted mb-0">Add, edit, and manage your car fleet</p>
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <FaPlus className="me-2" /> Add Car
            </Button>
          </div>

          <Card>
            <Card.Header className="bg-white">
              <InputGroup style={{ maxWidth: '300px' }}>
                <InputGroup.Text className="bg-light">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Car</th>
                    <th>Type</th>
                    <th>Price/Day</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.length > 0 ? (
                    filteredCars.map((car) => (
                      <tr key={car._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={car.images?.[0] || 'https://via.placeholder.com/60x40?text=Car'}
                              alt={`${car.brand} ${car.model}`}
                              className="rounded me-3"
                              style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                            />
                            <div>
                              <p className="mb-0 fw-semibold">{car.brand} {car.model}</p>
                              <small className="text-muted">{car.year} | {car.licensePlate}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="text-capitalize">
                            {car.type}
                          </Badge>
                        </td>
                        <td className="fw-semibold">${car.pricePerDay}/day</td>
                        <td>
                          <Badge bg={car.available ? 'success' : 'danger'}>
                            {car.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </td>
                        <td>
                          {car.ratingsAverage > 0 ? (
                            <span>
                              <span className="text-warning">★</span>
                              {' '}{car.ratingsAverage.toFixed(1)}
                              <small className="text-muted"> ({car.ratingsQuantity})</small>
                            </span>
                          ) : (
                            <span className="text-muted">No ratings</span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="light"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(car)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="text-danger"
                            onClick={() => handleDelete(car._id)}
                            disabled={deleting === car._id}
                          >
                            {deleting === car._id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        <FaCar size={32} className="mb-2" />
                        <p className="mb-0">No cars found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>

        {/* Add/Edit Car Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCar ? 'Edit Car' : 'Add New Car'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Brand *</Form.Label>
                    <Form.Control
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Toyota"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Model *</Form.Label>
                    <Form.Control
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Camry"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Year *</Form.Label>
                    <Form.Control
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      min={2000}
                      max={new Date().getFullYear() + 1}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Type *</Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      {carTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Price Per Day *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="pricePerDay"
                        value={formData.pricePerDay}
                        onChange={handleChange}
                        required
                        min={0}
                        step="0.01"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Seats</Form.Label>
                    <Form.Control
                      type="number"
                      name="seats"
                      value={formData.seats}
                      onChange={handleChange}
                      min={2}
                      max={15}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Transmission</Form.Label>
                    <Form.Select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                    >
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Fuel Type</Form.Label>
                    <Form.Select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                    >
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>License Plate</Form.Label>
                    <Form.Control
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      placeholder="e.g., ABC-1234"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Color</Form.Label>
                    <Form.Control
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="e.g., Silver"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Mileage</Form.Label>
                    <Form.Control
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      placeholder="e.g., 25000"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the car..."
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Label>Features</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {featureOptions.map(feature => (
                      <Badge
                        key={feature}
                        bg={formData.features.includes(feature) ? 'primary' : 'light'}
                        text={formData.features.includes(feature) ? 'white' : 'dark'}
                        className="cursor-pointer py-2 px-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleFeatureToggle(feature)}
                      >
                        {formData.features.includes(feature) && <FaCheck className="me-1" />}
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </Col>
                <Col md={12}>
                  <Form.Label>Images</Form.Label>
                  {formData.images.map((image, index) => (
                    <InputGroup className="mb-2" key={index}>
                      <InputGroup.Text>
                        <FaImage />
                      </InputGroup.Text>
                      <Form.Control
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="Image URL"
                      />
                      {formData.images.length > 1 && (
                        <Button
                          variant="outline-danger"
                          onClick={() => removeImageField(index)}
                        >
                          <FaTimes />
                        </Button>
                      )}
                    </InputGroup>
                  ))}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addImageField}
                  >
                    <FaPlus className="me-1" /> Add Image
                  </Button>
                </Col>
                <Col md={12}>
                  <Form.Check
                    type="switch"
                    id="available-switch"
                    name="available"
                    label="Available for booking"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  editingCar ? 'Update Car' : 'Add Car'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ManageCars;
