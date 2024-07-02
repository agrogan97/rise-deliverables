% model probabilities
% each row is a different model
% D, T, C, 3-step plan

m_ps = [.9, .9, .33, .5; % not d, not t, not c, not plan
    .9, .9, .33, .98; % not d, not t, not c, plan
    .99, .9, .33, .5; % d, not t, not c, not plan
    .99, .9, .33, .98; % d, not t, not c, plan
    .9, .99, .33, .5; % not d, t, not c, not plan
    .9, .99, .33, .98; % not d, t, not c, plan
    .99, .99, .33, .5; % d, t, not c, not plan
    .99, .99, .33, .98; % d, t, not c, plan
    .99, .99, .99, .98]; % d, t, c, plan


model_titles = {"!d,!t,!c,!plan", "!d,!t,!c,plan", "d,!t,!c,!plan", "d,!t,!c,plan", ...
    "!d,t,!c,!plan", "!d,t,!c,plan", "d,t,!c,!plan", "d,t,!c,plan", "d,t,c,plan", };

