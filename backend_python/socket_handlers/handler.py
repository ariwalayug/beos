"""
Socket.IO Event Handlers for BEOS Python Backend
"""

from models.blood_request import BloodRequest
from models.donor import Donor
from models.blood_bank import BloodBank
import asyncio


def setup_socket_handlers(sio):
    """Setup Socket.IO event handlers"""
    
    @sio.event
    async def connect(sid, environ):
        """Handle client connection"""
        print(f"Client connected: {sid}")
        await sio.emit('connected', {
            'message': 'Connected to Blood Emergency Platform',
            'timestamp': asyncio.get_event_loop().time()
        }, to=sid)
    
    @sio.event
    async def disconnect(sid):
        """Handle client disconnection"""
        print(f"Client disconnected: {sid}")
    
    @sio.on('get-critical-requests')
    async def handle_get_critical(sid):
        """Handle request for critical alerts"""
        try:
            critical_requests = await BloodRequest.get_critical()
            await sio.emit('critical-requests', critical_requests, to=sid)
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, to=sid)
    
    @sio.on('get-stats')
    async def handle_get_stats(sid):
        """Handle request for stats"""
        try:
            stats = {
                'requests': await BloodRequest.get_stats(),
                'donors': await Donor.get_stats(),
                'inventory': await BloodBank.get_total_inventory()
            }
            await sio.emit('stats-update', stats, to=sid)
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, to=sid)
    
    @sio.on('toggle-availability')
    async def handle_toggle_availability(sid, data):
        """Handle donor availability toggle"""
        try:
            donor_id = data.get('donorId')
            available = data.get('available')
            updated = await Donor.update(donor_id, {'available': available})
            await sio.emit('donor-updated', updated)
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, to=sid)
    
    @sio.on('emergency-request')
    async def handle_emergency_request(sid, data):
        """Handle new emergency request via socket"""
        try:
            data['urgency'] = 'critical'
            request = await BloodRequest.create(data)
            await sio.emit('new-request', request)
            await sio.emit('critical-alert', request)
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, to=sid)
    
    @sio.on('update-request-status')
    async def handle_update_status(sid, data):
        """Handle request status update"""
        try:
            request_id = data.get('requestId')
            status = data.get('status')
            updated = await BloodRequest.update(request_id, {'status': status})
            await sio.emit('request-updated', updated)
        except Exception as e:
            await sio.emit('error', {'message': str(e)}, to=sid)
    
    @sio.on('join-city')
    async def handle_join_city(sid, city):
        """Join city room for targeted notifications"""
        await sio.enter_room(sid, f'city:{city}')
        print(f"Socket {sid} joined city room: {city}")
    
    @sio.on('join-blood-type')
    async def handle_join_blood_type(sid, blood_type):
        """Join blood type room for targeted notifications"""
        await sio.enter_room(sid, f'blood:{blood_type}')
        print(f"Socket {sid} joined blood type room: {blood_type}")
    
    return sio
