function tr = populate_transitions(m_ps,trooms,ttools,drooms,dtools)


for m = 1:size(m_ps,1) % models
    
    stop  = 10;
    start = trooms(1);
    goal  = trooms(end);

    tr(stop,stop,m)         = 1;
    tr(goal,goal,m)         = 1;

    if length(trooms)<3
        tr(start,[goal,stop],m) = [m_ps(m,ttools(1)),1-m_ps(m,ttools(1))]; % depends on tool
    end
    if length(trooms)>=3

        tr(start,[trooms(2),stop],m)= [m_ps(m,ttools(1)),1-m_ps(m,ttools(1))]; % depends on tool ttools(1)

        if length(trooms)==3

            tr(trooms(2),[goal,stop],m) = [m_ps(m,ttools(2)),1-m_ps(m,ttools(2))]; % depends on tool ttools(2)

        elseif length(trooms)==4

            tr(trooms(2),[trooms(3),stop],m) = [m_ps(m,ttools(2)),1-m_ps(m,ttools(2))]; % depends on tool ttools(2)
            tr(trooms(3),[goal,stop],m)      = [m_ps(m,ttools(3)),1-m_ps(m,ttools(3))]; % depends on tool ttools(3)

        end
    end    

    if ~isempty(drooms) % distractor paths always consist of 4 rooms
        tr(start,[trooms(2),drooms(2),stop],m) = [m_ps(m,ttools(1)).*m_ps(m,end),m_ps(m,dtools(1)).*(1-m_ps(m,end)),1-(m_ps(m,ttools(1)).*m_ps(m,end)+m_ps(m,dtools(1)).*(1-m_ps(m,end)))]; % depends on tool ttools(1) & dtools(1)
        tr(drooms(2),[drooms(3),stop],m)  = [m_ps(m,dtools(2)),1-m_ps(m,dtools(2))]; % depends on tool dtools(2)
        tr(drooms(3),[drooms(4),stop],m)  = [m_ps(m,dtools(3)),1-m_ps(m,dtools(3))]; % depends on tool dtools(3)
        tr(drooms(4),stop,m)              = 1;   
    end

end