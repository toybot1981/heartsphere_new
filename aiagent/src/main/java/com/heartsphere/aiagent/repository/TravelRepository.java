package com.heartsphere.aiagent.repository;

import com.heartsphere.aiagent.entity.TravelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TravelRepository extends JpaRepository<TravelEntity, Long> {
    
    Optional<TravelEntity> findByTravelId(String travelId);
    
    List<TravelEntity> findByUserIdOrderByStartDateDesc(String userId);
    
    @Query("SELECT t FROM TravelEntity t WHERE t.flightDepartureTime BETWEEN :start AND :end AND t.flightReminderSent = false")
    List<TravelEntity> findUpcomingFlights(LocalDateTime start, LocalDateTime end);
    
    List<TravelEntity> findByDestination(String destination);
}








