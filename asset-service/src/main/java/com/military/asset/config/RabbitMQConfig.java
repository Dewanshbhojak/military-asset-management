package com.military.asset.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "military.events";
    public static final String INVENTORY_QUEUE = "asset.inventory.queue";

    @Bean
    public TopicExchange militaryExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue inventoryQueue() {
        return QueueBuilder.durable(INVENTORY_QUEUE).build();
    }

    @Bean
    public Binding purchaseBinding(Queue inventoryQueue, TopicExchange militaryExchange) {
        return BindingBuilder.bind(inventoryQueue).to(militaryExchange).with("purchase.created");
    }

    @Bean
    public Binding transferBinding(Queue inventoryQueue, TopicExchange militaryExchange) {
        return BindingBuilder.bind(inventoryQueue).to(militaryExchange).with("transfer.created");
    }

    @Bean
    public Binding assignmentBinding(Queue inventoryQueue, TopicExchange militaryExchange) {
        return BindingBuilder.bind(inventoryQueue).to(militaryExchange).with("assignment.created");
    }

    @Bean
    public Binding expenditureBinding(Queue inventoryQueue, TopicExchange militaryExchange) {
        return BindingBuilder.bind(inventoryQueue).to(militaryExchange).with("expenditure.created");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
