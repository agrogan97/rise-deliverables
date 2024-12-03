
data3 = read.csv("data_RISE_3_22_game_trial.txt")
data6 = read.csv("data_RISE_6_22_game_trial.txt")

library(tidyr)
library(dplyr)
library(ggplot2)
library(dabestr)
library(ggpubr)

data3$month = 3
data6$month = 6

data = rbind(data3, data6) 

data$game_n = data$game
data$game_n[is.nan(data$game_n)]<-NA
data <- fill(data, game_n, .direction = c("up"))

# plot levels
df = data3 %>%
  filter(learn==1 & last_attempt==1) %>%
  group_by(ppt_id, game) %>%
  summarise_at(vars(level), list(level = mean))  %>%
  group_by(game) %>%
  summarize(level_m = mean(level), level_sd = sd(level), level_n = n())

df$level_se = df$level_sd/sqrt(df$level_n)

ggplot(data=df, aes(x=game, y=level_m, ymin=level_m-level_se, ymax=level_m+level_se)) + 
  geom_line() + 
  geom_ribbon(alpha=0.5) +  
  xlab('Game') + 
  ylab("Level (mean ±standard error)") +
  theme_classic() +
  theme(aspect.ratio=9/16) +
  theme(text = element_text(size = 20))  




## learning perf
df = data %>%
  filter(learn==1 | transfer==1) %>%
  group_by(ppt_id, game) %>%
  summarise_at(vars(solved), list(perf = mean))  %>%
  group_by(game) %>%
  summarize(perf_m = mean(perf), perf_sd = sd(perf), perf_n = n())

df$perf_se = df$perf_sd/sqrt(df$perf_n)

t1 = ggplot(data=df, aes(x=game, y=perf_m, ymin=perf_m-perf_se, ymax=perf_m+perf_se)) + 
  geom_line() + 
  geom_ribbon(alpha=0.5) +  
  xlab('Game') + 
  ylab("% correct (M±SE)") +
  theme_classic() +
  theme(aspect.ratio=9/16) +
  theme(text = element_text(size = 14))   +
  ggtitle('Learning & transfer') 

# test
df = data %>%
  filter(test==1) %>%
  group_by(ppt_id, game_n) %>%
  summarise_at(vars(solved), list(perf = mean))  %>%
  group_by(game_n) %>%
  summarize(perf_m = mean(perf), perf_sd = sd(perf), perf_n = n())

df$perf_se = df$perf_sd/sqrt(df$perf_n)

t2 = ggplot(data=df, aes(x=game_n, y=perf_m, ymin=perf_m-perf_se, ymax=perf_m+perf_se)) + 
  geom_line() + 
  geom_ribbon(alpha=0.5) +  
  xlab('Game') + 
  ylab("% correct (M±SE)") +
  theme_classic() +
  theme(aspect.ratio=9/16) +
  theme(text = element_text(size = 14))   +
  ggtitle('Test problems') 

figure <- ggarrange(t1, t2,
                    labels = c("A", "B"),
                    ncol = 2, nrow = 1)

figure


## comparison of performance

df = data %>%
  filter(finished_exp==1 &  test==1) %>%
  group_by(ppt_id,month) %>%
  summarise_at(vars(solved), list(test = mean))

df2 = data %>%
  filter(finished_exp==1 &  transfer==1) %>%
  group_by(ppt_id,month) %>%
  summarise_at(vars(solved), list(transf = mean))

df3 = data %>%
  filter(finished_exp==1 &  learn==1) %>%
  group_by(ppt_id,month) %>%
  summarise_at(vars(solved), list(learn = mean))

df <- merge(df,df2,by=c("ppt_id","month"))
df <- merge(df,df3,by=c("ppt_id","month"))

two.group.unpaired <- 
  df %>%
  dabest(month, test, 
         # The idx below passes "Control" as the control group, 
         # and "Group1" as the test group. The mean difference
         # will be computed as mean(Group1) - mean(Control1).
         idx = c("3", "6"), 
         paired = FALSE)
two.group.unpaired.meandiff <- mean_diff(two.group.unpaired)
t1 = plot(two.group.unpaired.meandiff, color.column = month)
t1

two.group.unpaired <- 
  df %>%
  dabest(month, transf, 
         idx = c("3", "6"), 
         paired = FALSE)
two.group.unpaired.meandiff <- mean_diff(two.group.unpaired)
t2 = plot(two.group.unpaired.meandiff, color.column = month) 
t2

two.group.unpaired <- 
  df %>%
  dabest(month, learn, 
         idx = c("3", "6"), 
         paired = FALSE)
two.group.unpaired.meandiff <- mean_diff(two.group.unpaired)
t3 = plot(two.group.unpaired.meandiff, color.column = month)
t3

figure <- ggarrange(t1, t2, t3,
                    labels = c("A", "B", "C"),
                    ncol = 2, nrow = 2)

figure


## unfinished games

data$game_n = data$game
data$game_n[is.nan(data$game_n)]<-NA
data <- fill(data, game_n, .direction = c("up"))

df = data %>%
  #filter(finished_exp==0) %>%
  group_by(ppt_id,month) %>%
  summarise_at(vars(game_n), list(max_game = max)) %>%
  group_by(max_game,month) %>%
  summarize(num = n()) %>%
  group_by(month) %>%
  mutate(proportion = num / sum(num))


df$month = factor(df$month)

t1 = ggplot(data=df, aes(x=max_game, y=proportion, color = month)) + 
  geom_point() +
  geom_line() + 
  theme(legend.position="none") + 
  ggtitle('Proportion of participants') + 
  xlab('Game number') +
  theme(legend.position="bottom") 

t2 = ggplot(data=df, aes(x=max_game, y=num, color = month)) + 
  geom_point() +
  geom_line() +
  ggtitle('Number of participants') + 
  xlab('Game number') +
  theme(legend.position="bottom") 

figure <- ggarrange(t1, t2,
                    labels = c("A", "B"),
                    ncol = 2, nrow = 1)

figure



