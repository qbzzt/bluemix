(ns action.core)


(defn cljsMain [params] 
      (let [
	usefulParams (js->clj params)
	paramKeys (keys usefulParams)
	realKeys (filter #(not (or (= % "action") 
				   (= % "__ow_method") 
                                   (= % "__ow_headers") 
                                   (= % "__ow_path")
				   (= (get usefulParams %) "")
                                   ))
		paramKeys)
	data (reduce #(assoc %1 %2 (get usefulParams %2)) (list* {} realKeys))
      ]
      {
	"data" data
	"action" "processReorder"
      }	
      )
) 

