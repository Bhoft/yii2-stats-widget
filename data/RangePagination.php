<?php
namespace pavlm\yii\stats\data;

class RangePagination
{
    
    /**
     * @var \DateInterval
     */
    private $interval;

    /**
     * @var \DateTime
     */
    private $start;

    /**
     * @var \DateTime
     */
    private $end;
    
    /**
     * @var \DateTimeZone
     */
    private $timeZone;
    
    /**
     * @var \DatePeriod
     */
    private $datePeriod;
    
    /**
     * @var \DateTime
     */
    private $rangeStart;
    
    /**
     * @var \DateTime
     */
    private $rangeEnd;
    
    /**
     * 
     * @param string|\DateInterval $interval
     * @param integer|\DateTime $start
     * @param integer|\DateTime $end
     * @param string|\DateTimeZone $timeZone
     */
    public function __construct($interval = 'P1D', $start = null, $end = null, $timeZone = null)
    {
        $this->interval = is_string($interval) ? new \DateInterval($interval) : $interval;
        $this->setTimeZone($timeZone);
        $this->setStart($start);
        $this->setEnd($end);
        $this->init();
    }
    
    protected function setTimeZone($timeZone)
    {
        $this->timeZone = is_string($timeZone) ? 
            new \DateTimeZone($timeZone) : 
            (!$timeZone ? (new \DateTime())->getTimezone() : $timeZone);
    }
    
    public function getTimeZone()
    {
        return $this->timeZone;
    }

    protected function setStart($value)
    {
        if ($value) {
            $this->start = is_object($value) ? $value : \DateTime::createFromFormat('U', $value, $this->getTimeZone());
        } else {
            $this->start = $value;
        }
    }

    protected function setEnd($value)
    {
        if ($value && !$this->interval) {
            $this->end = is_object($value) ? $value : \DateTime::createFromFormat('U', $value, $this->getTimeZone());
        } else {
            $this->end = $value;
        }
    }
    
    protected function init()
    {
        // todo separate clamp date 
        $parts = ['y', 'm', 'd', 'h', 'i', 's'];
        $formats = ['Y', 'm', 'd', 'H', 'i', 's'];
        $values = [0, 1, 1, 0, 0, 0];
        $date = $this->getStart();
        if (!$date) {
            $date = new \DateTime();
            $date->setTimezone($this->timeZone);
        }
        foreach ($parts as $i => $part) {
            $values[$i] = $date->format($formats[$i]);
            if ($this->interval->$part) {
                break; // leave rest of part as zero
            }
        }
        call_user_func_array([$date, 'setDate'], array_slice($values, 0, 3));
        call_user_func_array([$date, 'setTime'], array_slice($values, 3, 3));
        $this->rangeStart = $date;
        if ($end = $this->getEnd()) {
            $this->rangeEnd = $end;
        } else {
            $date = clone $date;
            $this->rangeEnd = $date->add($this->interval);
        }
    }
    
    public function getInterval()
    {
        return $this->interval;
    }

    public function getStart()
    {
        return $this->start;
    }

    public function getEnd()
    {
        return $this->end;
    }
    
    public function getRangeStart()
    {
        return $this->rangeStart;
    }
    
    public function getRangeEnd()
    {
        return $this->rangeEnd;
    }
    
    public function getPrevRangeStart()
    {
        $date = clone $this->getRangeStart();
        return $date->sub($this->interval);
    }
    
    public function getNextRangeStart()
    {
        $date = clone $this->getRangeEnd();
        return clone $date;
    }
    
    /**
     * @return \DatePeriod
     */
    public function getDatePeriod()
    {
        return $this->datePeriod;
    }
}
