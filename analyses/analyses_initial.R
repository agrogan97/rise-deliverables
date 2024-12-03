library(dplyr)
library(ggplot2)
library(dabestr)
library(ggpubr)
library(stringr)
library(tidyverse)
library(data.table)
library(broom)


# get only completed data
data = read.csv("data/rounds_complete_2324.csv")

data = data %>% 
  rename(trial=expt_trial, game=trial_game, l_name=trial_layout, level=trial_level, solved=trial_solved,attempts=trial_attempts,ppt_id=id) %>% 
  mutate(transfer = trial_transfer=="True", test = trial_test=="True") %>%
  mutate(learn=(test==0 & transfer==0))  

data$round=data$game
data$round[data$test==1] = data$round[data$test==1] + round(data$round[data$test==1]/5)
data$round[data$test==0] = data$round[data$test==0] + floor((data$round[data$test==0]-1)/5)

data = data %>% 
  group_by(ppt_id,l_name) %>% 
  mutate(max_attempt = max(attempts)) %>% 
  mutate(last_attempt = ifelse(attempts == max_attempt, 1, 0))

incl = data %>% 
  group_by(ppt_id) %>% 
  summarize(last_game=max(game,na.rm=TRUE)) %>% 
  filter(last_game==80)

data_compl = data %>%
  filter(ppt_id %in% incl$ppt_id) 
df=data_compl

write.csv(df, "data/all_completed_round_level.csv")

## cleaning done above, it's in df
df = read.csv("data/all_completed_round_level.csv")

d = df %>%  
  group_by(ppt_id) %>%
  filter(attempts==1) %>%
  summarise(early_test = mean(solved[test==1 & game<26],na.rm=TRUE),
            train = mean(solved[learn==1],na.rm=TRUE),
            test = mean(solved[test==1],na.rm=TRUE),
            transfer = mean(solved[transfer==1],na.rm=TRUE),
            transf_index = transfer/train, 
            level1 = (sum(level==1,na.rm=TRUE))-5,
            level2 = (sum(level==2,na.rm=TRUE))-5,
            level3 = (sum(level==3,na.rm=TRUE))-5,
            level4 = (sum(level==4,na.rm=TRUE))-5,
            level5 = (sum(level==5,na.rm=TRUE))-5,
            level1_last_round = min(game[level==2 & learn==1],na.rm=TRUE)-1,
            level2_last_round = min(game[level==3 & learn==1],na.rm=TRUE)-1,
            level3_last_round = min(game[level==4 & learn==1],na.rm=TRUE)-1,
            level4_last_round = min(game[level==5 & learn==1],na.rm=TRUE)-1,
            complacency = sum(learn==1 & solved==0 & last_attempt==1),
            complacency_norm = sum(learn==1 & solved==0 & last_attempt==1)/sum(learn==1 & solved==0),
            complacency_transf = sum(learn==0 & solved==0 & last_attempt==1))
d[d==-Inf]=NA
d$transf = d$transfer>.5
d$transf = as.character(d$transf)

summary_measures = d %>%
  summarize(train = mean(train), test=mean(test), trabsfer = mean(transfer))

# plot performance
df = d %>% 
  sample_n(300) %>%
  pivot_longer(train:transfer, names_to = "Level", values_to = "Accuracy") 

estim.graphic.meandiff =  
  load(df,
       x = Level,
       y = Accuracy,
       idx = c("train", "transfer")) %>% 
  mean_diff()
dabest_plot(estim.graphic.meandiff)

# pca
pca_fit = d %>% 
  dplyr::select(train,test,transfer,level1,level2,level3,level4,level5,
                complacency,complacency_transf) %>%
  prcomp(scale = TRUE, center = TRUE)

p1 = pca_fit %>%
  tidy(matrix = "eigenvalues") %>%
  ggplot(aes(PC, percent)) +
  geom_col(alpha = 0.8) +
  scale_x_continuous(breaks = 1:100) +
  scale_y_continuous(
    labels = scales::percent_format(),
    expand = expansion(mult = c(0, 0.01))) +
  theme_classic()

p2 = pca_fit %>%
  augment(d) %>% # add original dataset back in
  ggplot(aes(.fittedPC1, .fittedPC2, color = transf, alpha=.2)) + 
  geom_point(size = 1.5) +
  scale_color_brewer(palette="Set1", limits = c("TRUE", "FALSE")) +
  ylab("Score component 2") +
  xlab("Score component 1") +
  theme_classic()

# plot rotation matrix
pca_fit %>%
  tidy(matrix = "rotation")
arrow_style <- arrow(
  angle = 20, ends = "first", type = "closed", length = grid::unit(8, "pt"))
p3 = pca_fit %>%
  tidy(matrix = "rotation") %>%
  pivot_wider(names_from = "PC", names_prefix = "PC", values_from = "value") %>%
  ggplot(aes(PC1, PC2)) +
  geom_segment(xend = 0, yend = 0, alpha=.7, arrow=arrow_style) +
  geom_text(aes(label = column), hjust = 1, nudge_x = -0.02, color = "#904C2F", alpha=.7) +
  xlim(-1, 1) + ylim(-1, 1) +
  coord_fixed() + # fix aspect ratio to 1:1
  theme_minimal()

figure <- ggarrange(p1, p2, p3, ncol = 3, nrow = 1)
figure

d2 = pca_fit %>%
  augment(d) %>% 
  mutate(train=round(train,5), test=round(test,5),
         transfer=round(transfer,5),score = -round(.fittedPC1,5)) %>%
  dplyr::select(ppt_id,train,test,transfer,level1,level2,level3,level4,level5,level4_last_round,
                complacency,complacency_transf,score)

write.csv(d2, "data/summary_completed_1675684946.csv")

ggplot(aes(x=score),data=d2) +
  geom_dotplot(binwidth = .03, stackdir = "centerwhole", alpha=.2) 


d3 <- d2 %>%                                    
  arrange(score)
