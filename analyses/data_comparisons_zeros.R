
library(dplyr)
library(ggplot2)
library(dabestr)
library(ggpubr)
library(data.table)
library(RColorBrewer)
library(stringr)

all_data = read.csv("data/all_roomworld_data.csv")
data = read.csv("data/rounds_complete_2024.csv")

data = filter(data,wasFirstComplete=="True")

data$trial = data$expt_trial
data$game = data$trial_game
data$l_name = data$trial_layout
data$level = data$trial_level
data$solved = data$trial_solved
data$attempts = data$trial_attempts
data$transfer = (data$trial_transfer=="True")
data$test = (data$trial_test=="True")
data$ppt_id = data$id
data$learn = data$test==0 & data$transfer==0
data$ppt_id = data$id
data$timestamp2 = data$round_start_time
data$completed = data$complete
data$sample = "RISE, Y4"

all_data = bind_rows(data,all_data)

exclude_zeros = all_data %>%
  group_by(ppt_id) %>%
  summarize(acc=mean(solved[transfer==0],na.rm=TRUE)) %>%
  filter(acc>0)

all_data = all_data %>%
  filter(ppt_id %in% exclude_zeros$ppt_id)

# sample 
set.seed(1)
# y3
all_ids = unique(all_data$ppt_id[all_data$sample=="RISE, Y3"]) 
sample_ids_y3= all_ids[sample(length(all_ids),500)]
# y4
all_ids = unique(all_data$ppt_id[all_data$sample=="RISE, Y4"]) 
sample_ids_y4= all_ids[sample(length(all_ids),500)]

remain_ids = all_data %>%
  filter(sample!="RISE, Y4",sample!="RISE, Y3")
remain_ids =  unique(remain_ids$ppt_id)

sample_ids = c(sample_ids_y3,sample_ids_y4,remain_ids)
data = all_data %>% 
  filter(all_data$ppt_id %in% sample_ids)

# make estimation graphics plots
# plot % solved training
df = data %>% 
  filter(learn==1) %>%
  filter(attempts==1) %>%
  #filter(last_attempt==1) %>%
  group_by(ppt_id, sample) %>%
  summarise(train = mean(solved,na.rm=TRUE))

estim.graphic <-  
  df %>%
  dabest(sample, train, 
         idx = c("RISE, Y4", "RISE, Y3", "RISE, Y2", "Oxford","Prolific"),
         id.col = ppt_id)
estim.graphic.meandiff <- mean_diff(estim.graphic)
t1 = plot(estim.graphic.meandiff, palette = rev(brewer.pal(6, "Blues")))
t1


# plot % solved test
df = data %>%
  filter(test==1) %>%
  group_by(ppt_id, sample) %>%
  summarise(test = mean(solved)) 

estim.graphic <-  
  df %>%
  dabest(sample, test, 
         idx = c("RISE, Y4", "RISE, Y3", "RISE, Y2", "Oxford","Prolific"),
         id.col = ppt_id,
         paired = TRUE)
estim.graphic.meandiff <- mean_diff(estim.graphic)
t2 = plot(estim.graphic.meandiff, palette = rev(brewer.pal(6, "Blues"))) 
t2

# plot % solved transfer
df = data %>% 
  filter(transfer==1) %>%
  filter(attempts==1) %>%
  group_by(ppt_id, sample) %>%
  summarise(transfer = mean(solved))

estim.graphic <-  
  df %>%
  dabest(sample, transfer, #acc, 
         idx = c("RISE, Y4", "RISE, Y3", "RISE, Y2", "Oxford","Prolific"),
         id.col = ppt_id,
         paired = TRUE)
estim.graphic.meandiff <- mean_diff(estim.graphic)
t3 = plot(estim.graphic.meandiff, palette = rev(brewer.pal(6, "Blues")))   
t3

figure <- ggarrange(t1, t2, t3, ncol = 3, nrow = 1)
figure


# plot learning performance 
df = data %>%
  filter(sample=="RISE, Y3") %>%
  filter(learn==1 & attempts==1 & game<=60) %>%
  group_by(game) %>%
  summarize_at(vars(solved),funs(mean,se=sqrt(mean(solved)*(1-mean(solved))/n())))

t4=ggplot(data=df, aes(x=game, y=mean, ymin=mean-se, ymax=mean+se)) +  # make plot
  geom_line() + 
  geom_ribbon(alpha=0.5) +  
  xlab('Round') + 
  ylab("Solved (M ±SE)") +
  ggtitle("Training") + 
  #ylim(c(0,1)) + 
  theme_classic() +
  theme(aspect.ratio=9/16) +
  theme(text = element_text(size = 16))     

# plot test performance 
df = data %>%
  filter(sample=="RISE, Y3") %>%
  filter(test==1) %>%
  group_by(game) %>%
  summarize_at(vars(solved),funs(mean,se=sqrt(mean(solved)*(1-mean(solved))/n()))) %>%
  mutate(game=round(game/5))

t5=ggplot(data=df, aes(x=game, y=mean, ymin=mean-se, ymax=mean+se)) +  # make plot
  geom_line() + 
  geom_ribbon(alpha=0.5) +  
  xlab('Round') + 
  ylab("Solved (M ±SE)") +
  ggtitle("Challenge") + 
  #ylim(c(0,1)) + 
  theme_classic() +
  theme(aspect.ratio=9/16) +
  theme(text = element_text(size = 16))   

# plot learning performance 
df = data %>%
  filter(sample=="RISE, Y3") %>%
  filter(transfer==1 & attempts==1 & game>=61) %>%
  group_by(game) %>%
  summarize_at(vars(solved),funs(mean,se=sqrt(mean(solved)*(1-mean(solved))/n())))

t6=ggplot(data=df, aes(x=game, y=mean, ymin=mean-se, ymax=mean+se)) +  # make plot
  geom_line() + 
  geom_ribbon(alpha=0.5) +  
  xlab('Round') + 
  ylab("Solved (M ±SE)") +
  ggtitle("Transfer") + 
  #ylim(c(0,1)) + 
  theme_classic() +
  theme(aspect.ratio=9/16) +
  theme(text = element_text(size = 16))  

figure <- ggarrange(t4, t5, t6, ncol = 3, nrow = 1)
figure

# test
df = data %>%
  filter(sample=="RISE, Y3") %>%
  filter(test==1 & startsWith(l_name,"test")) %>%
  group_by(l_name) %>%
  summarize_at(vars(solved),funs(mean,se=sqrt(mean(solved)*(1-mean(solved))/n()))) %>%
  mutate(test_game = as.numeric(str_extract(l_name, "\\d+")))

ggplot(data=df, aes(x=test_game, y=mean, ymin=mean-se, ymax=mean+se)) +  # make plot
  geom_line() + 
  geom_ribbon(alpha=0.5) +  
  xlab('Game') + 
  ylab("Solved (M ±SE)") +
  ggtitle("Test") + 
  #ylim(c(0,1)) + 
  theme_classic() +
  theme(aspect.ratio=9/16) +
  theme(text = element_text(size = 16))   

