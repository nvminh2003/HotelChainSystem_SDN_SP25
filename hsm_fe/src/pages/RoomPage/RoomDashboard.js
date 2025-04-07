import React, { useState, useEffect } from "react";
import { Calendar, Badge, DatePicker, Row, Col, Select, Card, Tooltip, Modal, Button, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import * as RoomDashboardService from "../../services/RoomDashboardService";
import * as HotelService from "../../services/HotelService";
import { useSelector } from 'react-redux';
import {
    RoomDashboardContainer,
    RoomGrid,
    Rooms,
    Room,
    CalendarSection,
    DatePickerStyled,
    Legend,
    StatsCard,
    FilterSection,
} from "./RoomDashboardStyle";

const { RangePicker } = DatePicker;
const { Option } = Select;

const RoomDashboard = () => {
    const account = useSelector((state) => state.account);
    const isAdmin = account.permissions?.includes('Admin');
    const userHotel = account.employee?.hotels?.[0] || null;

    const [selectedHotel, setSelectedHotel] = useState(null);
    const [dateRange, setDateRange] = useState([moment(), moment().add(7, 'days')]);
    const [roomsData, setRoomsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [filterFloor, setFilterFloor] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // Fetch hotels for admin
    const { data: hotels = [] } = useQuery({
        queryKey: ["hotels"],
        queryFn: HotelService.getAllHotel,
        enabled: isAdmin,
    });

    // Stats calculation
    const stats = {
        total: roomsData.length,
        available: roomsData.filter(room => room.status === "Available").length,
        occupied: roomsData.filter(room => room.status === "Occupied").length,
        maintenance: roomsData.filter(room => room.status === "Maintenance").length,
        cleaning: roomsData.filter(room => room.status === "Cleaning").length,
    };

    // Get unique floors and room types for filters
    const floors = [...new Set(roomsData.map(room => room.Floor))].sort((a, b) => a - b);
    const roomTypes = [...new Set(roomsData.map(room => room.roomtype?.TypeName))];

    useEffect(() => {
        if (!isAdmin && userHotel) {
            setSelectedHotel(userHotel._id);
        }
    }, [isAdmin, userHotel]);

    const fetchRoomData = async () => {
        if (!selectedHotel || !dateRange[0] || !dateRange[1]) return;

        setLoading(true);
        try {
            const response = await RoomDashboardService.getRoomDashboardData(
                selectedHotel,
                dateRange[0].format('YYYY-MM-DD'),
                dateRange[1].format('YYYY-MM-DD')
            );
            setRoomsData(response.data);
        } catch (error) {
            console.error("Error fetching room data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomData();
    }, [selectedHotel, dateRange]);

    const handleRoomClick = async (room) => {
        setSelectedRoom(room);
        try {
            const status = await RoomDashboardService.getRoomBookingStatus(
                room._id,
                dateRange[0].format('YYYY-MM-DD'),
                dateRange[1].format('YYYY-MM-DD')
            );
            setSelectedRoom(prev => ({ ...prev, bookingStatus: status.data }));
            setIsModalVisible(true);
        } catch (error) {
            console.error("Error fetching room status:", error);
        }
    };

    const filteredRooms = roomsData.filter(room => {
        const floorMatch = filterFloor === 'all' || room.Floor.toString() === filterFloor;
        const typeMatch = filterType === 'all' || room.roomtype?.TypeName === filterType;
        return floorMatch && typeMatch;
    });

    const getStatusColor = (status) => {
        const colors = {
            'Available': '#52c41a',
            'Occupied': '#f5222d',
            'Maintenance': '#faad14',
            'Cleaning': '#1890ff'
        };
        return colors[status] || '#d9d9d9';
    };

    return (
        <RoomDashboardContainer>
            <Row gutter={[24, 24]}>
                {/* Stats Cards */}
                <Col span={24}>
                    <Row gutter={16}>
                        <Col span={4}>
                            <StatsCard title="Total Rooms" value={stats.total} />
                        </Col>
                        <Col span={4}>
                            <StatsCard title="Available" value={stats.available} color="#52c41a" />
                        </Col>
                        <Col span={4}>
                            <StatsCard title="Occupied" value={stats.occupied} color="#f5222d" />
                        </Col>
                        <Col span={4}>
                            <StatsCard title="Maintenance" value={stats.maintenance} color="#faad14" />
                        </Col>
                        <Col span={4}>
                            <StatsCard title="Cleaning" value={stats.cleaning} color="#1890ff" />
                        </Col>
                    </Row>
                </Col>

                {/* Filters */}
                <Col span={24}>
                    <FilterSection>
                        <Row gutter={16} align="middle">
                            {isAdmin && (
                                <Col span={6}>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Select Hotel"
                                        onChange={setSelectedHotel}
                                        value={selectedHotel}
                                    >
                                        {hotels?.data?.map(hotel => (
                                            <Option key={hotel._id} value={hotel._id}>
                                                {hotel.NameHotel}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                            )}
                            <Col span={6}>
                                <RangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={4}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Floor"
                                    onChange={setFilterFloor}
                                    value={filterFloor}
                                >
                                    <Option value="all">All Floors</Option>
                                    {floors.map(floor => (
                                        <Option key={floor} value={floor.toString()}>
                                            Floor {floor}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={4}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Room Type"
                                    onChange={setFilterType}
                                    value={filterType}
                                >
                                    <Option value="all">All Types</Option>
                                    {roomTypes.map(type => (
                                        <Option key={type} value={type}>
                                            {type}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    </FilterSection>
                </Col>

                {/* Room Grid */}
                <Col span={24}>
                    <Spin spinning={loading}>
                        <RoomGrid>
                            <Rooms>
                                {filteredRooms.map((room) => (
                                    <Tooltip
                                        key={room._id}
                                        title={`${room.RoomName} - ${room.roomtype?.TypeName}
                                        Floor: ${room.Floor}
                                        Status: ${room.status}
                                        Price: ${room.Price}`}
                                    >
                                        <Room
                                            onClick={() => handleRoomClick(room)}
                                            style={{
                                                backgroundColor: getStatusColor(room.status),
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div>{room.RoomName}</div>
                                            <small>{room.status}</small>
                                        </Room>
                                    </Tooltip>
                                ))}
                            </Rooms>
                        </RoomGrid>
                    </Spin>
                </Col>
            </Row>

            <Modal
                title={`Room Details - ${selectedRoom?.RoomName}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedRoom && (
                    <div>
                        <p><strong>Room Type:</strong> {selectedRoom.roomtype?.TypeName}</p>
                        <p><strong>Floor:</strong> {selectedRoom.Floor}</p>
                        <p><strong>Status:</strong> {selectedRoom.status}</p>
                        <p><strong>Price:</strong> ${selectedRoom.Price}</p>
                        {selectedRoom.bookingStatus && (
                            <div>
                                <h3>Upcoming Bookings</h3>
                                {selectedRoom.bookingStatus.map((booking, index) => (
                                    <Card key={index} size="small" style={{ marginBottom: 8 }}>
                                        <p>Check-in: {moment(booking.checkIn).format('YYYY-MM-DD')}</p>
                                        <p>Check-out: {moment(booking.checkOut).format('YYYY-MM-DD')}</p>
                                        <p>Guest: {booking.guestName}</p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Legend>
                <Badge color="#52c41a" text="Available" />
                <Badge color="#f5222d" text="Occupied" />
                <Badge color="#faad14" text="Maintenance" />
                <Badge color="#1890ff" text="Cleaning" />
            </Legend>
        </RoomDashboardContainer>
    );
};

export default RoomDashboard;
