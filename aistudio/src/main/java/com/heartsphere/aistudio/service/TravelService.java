package com.heartsphere.aistudio.service;

import com.heartsphere.aistudio.entity.TravelEntity;
import com.heartsphere.aistudio.repository.TravelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 行程管理服务
 * 提供行程管理和航班提醒功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TravelService {
    
    private final TravelRepository travelRepository;
    
    /**
     * 创建行程
     */
    @Transactional
    public TravelEntity createTravel(String userId, String destination, 
                                    LocalDateTime startDate, LocalDateTime endDate,
                                    String flightNumber, LocalDateTime flightDepartureTime,
                                    String hotelId, String hotelName,
                                    String itinerary, String notes) {
        TravelEntity travel = new TravelEntity();
        travel.setUserId(userId);
        travel.setDestination(destination);
        travel.setStartDate(startDate);
        travel.setEndDate(endDate);
        travel.setFlightNumber(flightNumber);
        travel.setFlightDepartureTime(flightDepartureTime);
        travel.setHotelId(hotelId);
        travel.setHotelName(hotelName);
        travel.setItinerary(itinerary);
        travel.setNotes(notes);
        
        return travelRepository.save(travel);
    }
    
    /**
     * 获取用户所有行程
     */
    public List<TravelEntity> getUserTravels(String userId) {
        return travelRepository.findByUserIdOrderByStartDateDesc(userId);
    }
    
    /**
     * 获取行程详情
     */
    public TravelEntity getTravel(String travelId) {
        return travelRepository.findByTravelId(travelId)
            .orElseThrow(() -> new IllegalArgumentException("行程不存在: " + travelId));
    }
    
    /**
     * 更新行程
     */
    @Transactional
    public TravelEntity updateTravel(String travelId, TravelEntity updates) {
        TravelEntity travel = getTravel(travelId);
        
        if (updates.getDestination() != null) {
            travel.setDestination(updates.getDestination());
        }
        if (updates.getStartDate() != null) {
            travel.setStartDate(updates.getStartDate());
        }
        if (updates.getEndDate() != null) {
            travel.setEndDate(updates.getEndDate());
        }
        if (updates.getFlightNumber() != null) {
            travel.setFlightNumber(updates.getFlightNumber());
        }
        if (updates.getFlightDepartureTime() != null) {
            travel.setFlightDepartureTime(updates.getFlightDepartureTime());
        }
        if (updates.getHotelId() != null) {
            travel.setHotelId(updates.getHotelId());
        }
        if (updates.getHotelName() != null) {
            travel.setHotelName(updates.getHotelName());
        }
        if (updates.getItinerary() != null) {
            travel.setItinerary(updates.getItinerary());
        }
        if (updates.getNotes() != null) {
            travel.setNotes(updates.getNotes());
        }
        
        return travelRepository.save(travel);
    }
    
    /**
     * 删除行程
     */
    @Transactional
    public void deleteTravel(String travelId) {
        travelRepository.findByTravelId(travelId)
            .ifPresent(travelRepository::delete);
    }
    
    /**
     * 获取即将起飞的航班（用于提醒）
     * 检查未来24小时内的航班
     */
    public List<TravelEntity> getUpcomingFlights() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusHours(24);
        return travelRepository.findUpcomingFlights(now, tomorrow);
    }
    
    /**
     * 发送航班提醒
     * 定时任务：每小时检查一次
     */
    @Scheduled(fixedRate = 3600000) // 每小时执行一次
    public void sendFlightReminders() {
        List<TravelEntity> upcomingFlights = getUpcomingFlights();
        
        for (TravelEntity travel : upcomingFlights) {
            if (!travel.getFlightReminderSent()) {
                sendReminder(travel);
                travel.setFlightReminderSent(true);
                travelRepository.save(travel);
            }
        }
    }
    
    /**
     * 发送提醒（可以集成通知服务）
     */
    private void sendReminder(TravelEntity travel) {
        log.info("发送航班提醒: 用户={}, 目的地={}, 航班号={}, 起飞时间={}", 
            travel.getUserId(), travel.getDestination(), 
            travel.getFlightNumber(), travel.getFlightDepartureTime());
        
        // 这里可以集成：
        // 1. 短信服务
        // 2. 邮件服务
        // 3. 推送通知
        // 4. 微信/钉钉机器人
    }
}








