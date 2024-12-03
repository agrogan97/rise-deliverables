
clear

load('effugium_round_info.mat')

% model probabilities
% each row is a different model
% D, T, C, 3-step plan
m_ps = [.9, .9, .33, .5; % not d, not t, not c, not plan
        .99, .99, .33, .5; % d, t, not c, not plan
        .99, .99, .33, .98; % d, t, not c, plan
        .99, .99, .99, .5; % d, t, c, not plan
        .99, .99, .99, .98]; % d, t, c, plan
model_titles = ["!d,!t,!c,!plan", "d,t,!c,!plan", "d,t,!c,plan", "d,t,c,!plan", "d,t,c,plan"];

n_steps  = 4;
n_games  = 72;
n_models = size(m_ps,1);
    
for model_sim = 1:n_models
    
    % loop for participant

    level    = 1;
    sublevel = 0;
    test     = 0;
    tests    = shuffle(1:12);
    
    correct_array = zeros(1,5);
    l = ones(n_steps+1,n_games,n_models);


    for game = 1:n_games

        % add test trials
        if mod(game,6)==0

            test   = test+1;
            layout = ['test_' num2str(tests(test)) '.txt'];

        else
            sublevel = sublevel+1;

            if (mean(correct_array)==1) && (level<5) && sublevel>5
                level = level+1;
                sublevel = 1;
            end

            layout = ['r' num2str(level) '_' num2str(sublevel) '_' num2str(randi(20)) '.txt'];
        end

        % check if test 

        %layout = 'test_1.txt';

        % rooms
        trooms = cell2mat(T.t_rooms(T.layout==layout));
        drooms = cell2mat(T.d_rooms(T.layout==layout));
        % target tools
        a = cell2mat(T.t_tools(T.layout==layout));
        ttools = ismember(a,'d') + ismember(a,'t').*2 + ismember(a,'c').*3;
        % distractor tools
        a = cell2mat(T.d_tools(T.layout==layout));
        dtools = ismember(a,'d') + ismember(a,'t').*2 + ismember(a,'c').*3;

        tr = populate_transitions(m_ps,trooms,ttools,drooms,dtools);

        % create markov chain objects
        mc = dtmc(tr(:,:,model_sim));

        % sample sequences
        x0        = zeros(1,10);
        x0(trooms(1)) = 1;
        sim_seq   = simulate(mc,n_steps,'X0',x0);

        for m = 1:size(m_ps,1)
            for i = 2:(n_steps+1)
                sequence = sim_seq;
                s1 = sequence(i-1);
                s2 = sequence(i);

                l(i-1,game,m)  = l(i-1,game,m).*tr(s1,s2,m); %likelihood for each of the models
            end
        end

        if mod(game,6)~=0
            correct = sim_seq(end)==trooms(end);
            correct_array = [correct_array(2:end), correct];
        end

        %layout
         
    end

    l(l==1)= nan;
    nll(model_sim,:) = -squeeze(nanmean(nanmean(log(l),1),2));
    
    %nexttile
end

%%

figure('Position',[1 282 1141 515]);
nexttile
bar(nll)
xlabel("simulation with")
xticklabels(model_titles)
set(gca,'FontSize',14)
leg=legend(["model 1","model 2","model 3", "model 4"],'Location','Best');
title(leg,"likelihood of")

nexttile
heatmap(nll)

set(gca,'FontSize',14)
ylabel("log likelihood")
