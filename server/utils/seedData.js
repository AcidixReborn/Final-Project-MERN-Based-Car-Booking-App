const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const Car = require('../models/Car');
const Extra = require('../models/Extra');
const User = require('../models/User');

// Sample car data - 15 cars across different categories
const cars = [
  // Economy (4 cars)
  {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    type: 'economy',
    pricePerDay: 45,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    mileage: 15000,
    images: [
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'
    ],
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Lane Assist', 'Cruise Control'],
    description: 'The Toyota Corolla offers exceptional fuel efficiency and reliability. Perfect for daily commuting and city driving with modern safety features.',
    available: true,
    location: 'Main Office',
    licensePlate: 'ECO-001'
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2024,
    type: 'economy',
    pricePerDay: 50,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 12000,
    images: [
      'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800',
      'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800'
    ],
    features: ['Bluetooth', 'Backup Camera', 'Android Auto', 'Honda Sensing', 'Sunroof'],
    description: 'The Honda Civic combines sporty handling with excellent fuel economy. A top choice for those seeking reliability and style.',
    available: true,
    location: 'Main Office',
    licensePlate: 'ECO-002'
  },
  {
    brand: 'Nissan',
    model: 'Sentra',
    year: 2023,
    type: 'economy',
    pricePerDay: 42,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 20000,
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'
    ],
    features: ['Bluetooth', 'Backup Camera', 'USB Ports', 'Automatic Emergency Braking'],
    description: 'The Nissan Sentra offers a comfortable ride with impressive standard safety features at an affordable price.',
    available: true,
    location: 'Airport Terminal',
    licensePlate: 'ECO-003'
  },
  {
    brand: 'Hyundai',
    model: 'Elantra',
    year: 2024,
    type: 'economy',
    pricePerDay: 48,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 8000,
    images: [
      'https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=800'
    ],
    features: ['Bluetooth', 'Wireless Charging', 'Digital Key', 'Smart Cruise Control', '10.25" Display'],
    description: 'The Hyundai Elantra features bold styling and cutting-edge technology. Great value with a comprehensive warranty.',
    available: true,
    location: 'Main Office',
    licensePlate: 'ECO-004'
  },

  // SUV (4 cars)
  {
    brand: 'Toyota',
    model: 'RAV4',
    year: 2024,
    type: 'suv',
    pricePerDay: 75,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    mileage: 10000,
    images: [
      'https://images.unsplash.com/photo-1568844293986-8c1a5c53d193?w=800',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'
    ],
    features: ['AWD', 'Bluetooth', 'Backup Camera', 'Toyota Safety Sense', 'Power Liftgate', 'Roof Rails'],
    description: 'The Toyota RAV4 Hybrid delivers exceptional fuel economy with SUV versatility. Perfect for adventures and family trips.',
    available: true,
    location: 'Main Office',
    licensePlate: 'SUV-001'
  },
  {
    brand: 'Honda',
    model: 'CR-V',
    year: 2024,
    type: 'suv',
    pricePerDay: 72,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 14000,
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'
    ],
    features: ['AWD', 'Bluetooth', 'Backup Camera', 'Honda Sensing', 'Hands-Free Liftgate', 'Heated Seats'],
    description: 'The Honda CR-V offers a spacious interior and smooth ride. One of the best-selling SUVs for good reason.',
    available: true,
    location: 'Airport Terminal',
    licensePlate: 'SUV-002'
  },
  {
    brand: 'Ford',
    model: 'Explorer',
    year: 2024,
    type: 'suv',
    pricePerDay: 95,
    seats: 7,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 18000,
    images: [
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800'
    ],
    features: ['4WD', 'Third Row Seating', 'SYNC 4', 'Co-Pilot360', 'Panoramic Roof', 'Towing Package'],
    description: 'The Ford Explorer provides three-row seating and powerful performance. Ideal for large families and group travel.',
    available: true,
    location: 'Main Office',
    licensePlate: 'SUV-003'
  },
  {
    brand: 'Jeep',
    model: 'Grand Cherokee',
    year: 2024,
    type: 'suv',
    pricePerDay: 110,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 9000,
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'
    ],
    features: ['4x4', 'Bluetooth', 'Uconnect 5', 'Air Suspension', 'Leather Seats', 'Off-Road Package'],
    description: 'The Jeep Grand Cherokee combines luxury with legendary off-road capability. Perfect for those who want it all.',
    available: true,
    location: 'Main Office',
    licensePlate: 'SUV-004'
  },

  // Luxury (4 cars)
  {
    brand: 'BMW',
    model: '5 Series',
    year: 2024,
    type: 'luxury',
    pricePerDay: 150,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 5000,
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
    ],
    features: ['Leather Interior', 'iDrive 8', 'Harman Kardon Sound', 'Heated/Cooled Seats', 'Parking Assistant', 'Head-Up Display'],
    description: 'The BMW 5 Series delivers the ultimate driving experience with cutting-edge technology and refined luxury.',
    available: true,
    location: 'Main Office',
    licensePlate: 'LUX-001'
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2024,
    type: 'luxury',
    pricePerDay: 160,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 7000,
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'
    ],
    features: ['Leather Interior', 'MBUX', 'Burmester Sound', 'Massage Seats', 'Air Balance Package', '64-Color Ambient Lighting'],
    description: 'The Mercedes-Benz E-Class epitomizes elegance and innovation. Experience first-class comfort on every journey.',
    available: true,
    location: 'Main Office',
    licensePlate: 'LUX-002'
  },
  {
    brand: 'Audi',
    model: 'A6',
    year: 2024,
    type: 'luxury',
    pricePerDay: 145,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 11000,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'
    ],
    features: ['Quattro AWD', 'Virtual Cockpit', 'Bang & Olufsen Sound', 'Matrix LED Lights', 'Leather Interior', 'Adaptive Air Suspension'],
    description: 'The Audi A6 combines sophisticated design with quattro all-wheel drive. German engineering at its finest.',
    available: true,
    location: 'Airport Terminal',
    licensePlate: 'LUX-003'
  },
  {
    brand: 'Lexus',
    model: 'ES',
    year: 2024,
    type: 'luxury',
    pricePerDay: 135,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'hybrid',
    mileage: 6000,
    images: [
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800'
    ],
    features: ['Mark Levinson Audio', 'Leather Interior', 'Lexus Safety System+', 'Head-Up Display', 'Panoramic Roof', 'Wireless Charging'],
    description: 'The Lexus ES offers whisper-quiet comfort and exceptional reliability. Japanese luxury and hybrid efficiency combined.',
    available: true,
    location: 'Main Office',
    licensePlate: 'LUX-004'
  },

  // Sports (3 cars)
  {
    brand: 'Ford',
    model: 'Mustang',
    year: 2024,
    type: 'sports',
    pricePerDay: 120,
    seats: 4,
    transmission: 'manual',
    fuelType: 'gasoline',
    mileage: 8000,
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5f82d718b?w=800',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'
    ],
    features: ['V8 Engine', 'Performance Package', 'Track Apps', 'Launch Control', 'Brembo Brakes', 'Active Exhaust'],
    description: 'The Ford Mustang GT delivers raw American muscle. Feel the thrill of 450 horsepower and iconic styling.',
    available: true,
    location: 'Main Office',
    licensePlate: 'SPT-001'
  },
  {
    brand: 'Chevrolet',
    model: 'Camaro',
    year: 2024,
    type: 'sports',
    pricePerDay: 115,
    seats: 4,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 12000,
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
    ],
    features: ['V8 Engine', 'Magnetic Ride Control', 'Performance Data Recorder', 'Bose Audio', 'Head-Up Display', 'Recaro Seats'],
    description: 'The Chevrolet Camaro combines aggressive styling with track-ready performance. An American icon.',
    available: true,
    location: 'Main Office',
    licensePlate: 'SPT-002'
  },
  {
    brand: 'Dodge',
    model: 'Challenger',
    year: 2024,
    type: 'sports',
    pricePerDay: 125,
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    mileage: 10000,
    images: [
      'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800'
    ],
    features: ['HEMI V8', 'Super Track Pak', 'Harman Kardon Audio', 'Launch Control', 'Performance Seats', 'SRT Drive Modes'],
    description: 'The Dodge Challenger R/T delivers muscle car heritage with modern performance. Pure American power.',
    available: true,
    location: 'Airport Terminal',
    licensePlate: 'SPT-003'
  }
];

// Extras/add-ons
const extras = [
  {
    name: 'Full Coverage Insurance',
    description: 'Comprehensive insurance coverage with zero deductible. Peace of mind for your entire trip.',
    pricePerDay: 25,
    category: 'protection',
    icon: 'shield',
    available: true,
    maxQuantity: 1
  },
  {
    name: 'GPS Navigation',
    description: 'Portable GPS unit with up-to-date maps and traffic information. Never get lost.',
    pricePerDay: 10,
    category: 'convenience',
    icon: 'map',
    available: true,
    maxQuantity: 1
  },
  {
    name: 'Child Safety Seat',
    description: 'Rear-facing or forward-facing car seat suitable for children. Safety tested and approved.',
    pricePerDay: 12,
    category: 'child-safety',
    icon: 'baby',
    available: true,
    maxQuantity: 3
  },
  {
    name: 'Booster Seat',
    description: 'Booster seat for older children. Ensures proper seatbelt positioning.',
    pricePerDay: 8,
    category: 'child-safety',
    icon: 'child',
    available: true,
    maxQuantity: 3
  },
  {
    name: 'Additional Driver',
    description: 'Add another authorized driver to your rental agreement.',
    pricePerDay: 15,
    category: 'convenience',
    icon: 'user-plus',
    available: true,
    maxQuantity: 2
  },
  {
    name: 'Roadside Assistance Plus',
    description: 'Enhanced roadside assistance with priority service and extended coverage.',
    pricePerDay: 8,
    category: 'protection',
    icon: 'phone',
    available: true,
    maxQuantity: 1
  },
  {
    name: 'WiFi Hotspot',
    description: 'Portable WiFi device with unlimited data. Stay connected on the go.',
    pricePerDay: 12,
    category: 'convenience',
    icon: 'wifi',
    available: true,
    maxQuantity: 1
  }
];

// Admin user for testing
const adminUser = {
  name: 'Admin User',
  email: 'admin@carbooking.com',
  password: 'admin123',
  role: 'admin',
  phone: '555-0100'
};

// Test user
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'user',
  phone: '555-0101'
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Car.deleteMany({});
    await Extra.deleteMany({});
    console.log('Cleared existing cars and extras');

    // Check if admin exists, if not create
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await User.create(adminUser);
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Check if test user exists, if not create
    const existingUser = await User.findOne({ email: testUser.email });
    if (!existingUser) {
      await User.create(testUser);
      console.log('Test user created');
    } else {
      console.log('Test user already exists');
    }

    // Insert cars
    const insertedCars = await Car.insertMany(cars);
    console.log(`${insertedCars.length} cars inserted`);

    // Insert extras
    const insertedExtras = await Extra.insertMany(extras);
    console.log(`${insertedExtras.length} extras inserted`);

    console.log('\n=== Seed Data Complete ===');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@carbooking.com / admin123');
    console.log('User:  john@example.com / password123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
