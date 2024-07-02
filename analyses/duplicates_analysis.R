
library(dplyr)
library(ggplot2)
library(dabestr)
library(ggpubr)
library(data.table)
library(RColorBrewer)
library(stringr)

data = read.csv("data/rise_year4_duplicateLabelled_rounds.csv")

data$trial = data$expt_trial
data$game = data$trial_game
data$l_name = data$trial_layout
data$level = data$trial_level
data$solved = data$trial_solved
data$attempts = data$trial_attempts
data$transfer = (data$trial_transfer=="True")
data$test = (data$trial_test=="True")
data$ppt_id = data$ppt_id
data$learn = data$test==0 & data$transfer==0
data$ppt_id = data$id
data$timestamp2 = data$round_start_time
data$completed = data$complete
data$sample = "RISE, Y4"


df = data %>% 
  group_by(riseId,duplicateOrder) %>% 
  summarise(mean(solved,na.rm=TRUE), max_duplicate = max(duplicateOrder)) %>% 
  ungroup() %>% 
  filter(duplicateOrder==1)
  
